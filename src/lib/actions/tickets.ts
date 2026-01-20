"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { createTicketSchema } from "@/src/lib/validators/ticket";
import { createTicket, generateTicketNumber } from "@/src/db/mutations/tickets";
import { getTicketsByUserId } from "@/src/db/queries/tickets";
import { TicketPriority } from "@/src/db/schema/enums";
import { createTicketMessage } from "@/src/db/mutations/ticket-messages";
import { uploadFileToStorage } from "@/src/lib/storage/upload";
import { createTicketAttachment } from "@/src/db/mutations/ticket-attachments";
import { notifyTicketCreated, notifyAdminNewTicket } from "@/src/lib/email/notifications";
import { getTicketById } from "@/src/db/queries/tickets";

export async function createTicketAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        error: "Você precisa estar autenticado para criar um ticket",
      };
    }

    const title = formData.get("title");
    const description = formData.get("description");
    const priority = formData.get("priority");

    if (!title || !description || !priority) {
      return {
        error: "Todos os campos são obrigatórios",
      };
    }

    const validation = createTicketSchema.safeParse({
      title: title.toString(),
      description: description.toString(),
      priority: priority.toString(),
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return {
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }

    const { title: validatedTitle, description: validatedDescription, priority: validatedPriority } = validation.data;

    const ticketNumber = await generateTicketNumber();

    const ticket = await createTicket({
      ticketNumber,
      title: validatedTitle,
      description: validatedDescription,
      priority: validatedPriority,
      userId: user.id,
    });

    if (!ticket) {
      return {
        error: "Erro ao criar ticket: nenhum registro retornado",
      };
    }

    const fullTicket = await getTicketById(ticket.id);
    const isUrgent = validatedPriority === TicketPriority.URGENT;

    try {
      await notifyTicketCreated({
        userEmail: user.email,
        userName: user.name,
        ticketNumber: ticket.ticketNumber,
        ticketTitle: validatedTitle,
        ticketPriority: validatedPriority,
        ticketId: ticket.id,
      });

      await notifyAdminNewTicket({
        ticketNumber: ticket.ticketNumber,
        ticketTitle: validatedTitle,
        userName: user.name,
        ticketPriority: validatedPriority,
        ticketId: ticket.id,
        isUrgent,
      });
    } catch (emailError) {
      console.error("Erro ao enviar e-mail de notificação:", emailError);
    }

    const files = formData.getAll("files") as File[];
    
    if (files.length > 0) {
      const initialMessage = await createTicketMessage({
        ticketId: ticket.id,
        userId: user.id,
        message: validatedDescription,
      });

      for (const file of files) {
        if (file.size > 0) {
          const uploadResult = await uploadFileToStorage(
            file,
            ticket.id,
            initialMessage.id
          );

          if (uploadResult.url) {
            await createTicketAttachment({
              ticketMessageId: initialMessage.id,
              fileName: file.name,
              fileUrl: uploadResult.url,
              fileType: file.type,
              fileSize: file.size.toString(),
            });
          }
        }
      }
    }

    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    redirect(`/tickets/${ticket.id}`);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    let errorMessage = "Erro ao criar ticket. Tente novamente.";

    if (error instanceof Error) {
      const errorString = error.message.toLowerCase();

      if (errorString.includes("unique constraint") || errorString.includes("duplicate")) {
        errorMessage = "Erro: número de ticket duplicado. Tente novamente.";
      } else if (errorString.includes("foreign key constraint") || errorString.includes("user")) {
        errorMessage = "Erro: usuário não encontrado. Faça login novamente.";
      } else if (
        errorString.includes("connection") ||
        errorString.includes("timeout") ||
        errorString.includes("database_url") ||
        errorString.includes("connect")
      ) {
        errorMessage =
          "Erro de conexão com o banco de dados. Verifique se a variável DATABASE_URL está configurada corretamente.";
      } else if (errorString.includes("syntax error") || errorString.includes("invalid")) {
        errorMessage = "Erro: dados inválidos. Verifique os campos preenchidos.";
      } else if (errorString.includes("enum") || errorString.includes("invalid enum")) {
        errorMessage = `Erro: prioridade inválida. Use uma das opções: ${Object.values(TicketPriority).join(", ")}.`;
      } else if (errorString.includes("relation") || errorString.includes("table")) {
        errorMessage =
          "Erro: tabela não encontrada. Execute as migrations do banco de dados (npm run db:push ou npm run db:migrate).";
      } else {
        errorMessage = `Erro ao criar ticket: ${error.message}`;
      }
    }

    return {
      error: errorMessage,
    };
  }
}

export async function getUserTickets() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const tickets = await getTicketsByUserId(user.id);
  return tickets;
}
