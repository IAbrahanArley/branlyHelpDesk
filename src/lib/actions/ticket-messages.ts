"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { createTicketMessageSchema } from "@/src/lib/validators/ticket-message";
import { createTicketMessage } from "@/src/db/mutations/ticket-messages";
import { getTicketById } from "@/src/db/queries/tickets";
import { uploadFileToStorage } from "@/src/lib/storage/upload";
import { createTicketAttachment } from "@/src/db/mutations/ticket-attachments";
import { notifyUserAdminResponse } from "@/src/lib/email/notifications";

export async function createTicketMessageAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: "Você precisa estar autenticado para enviar uma mensagem",
      messageId: null,
    };
  }

  const validation = createTicketMessageSchema.safeParse({
    message: formData.get("message"),
    ticketId: formData.get("ticketId"),
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
      messageId: null,
    };
  }

  const { message, ticketId } = validation.data;

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    return {
      error: "Ticket não encontrado",
      messageId: null,
    };
  }

  if (ticket.userId !== user.id && user.role !== "ADMIN") {
    return {
      error: "Você não tem permissão para enviar mensagens neste ticket",
      messageId: null,
    };
  }

  if (ticket.status === "CLOSED") {
    return {
      error: "Não é possível enviar mensagens em tickets fechados",
      messageId: null,
    };
  }

  try {
    const ticketMessage = await createTicketMessage({
      ticketId,
      userId: user.id,
      message,
    });

    const files = formData.getAll("files") as File[];

    if (files.length > 0) {
      for (const file of files) {
        if (file.size > 0) {
          const uploadResult = await uploadFileToStorage(
            file,
            ticketId,
            ticketMessage.id
          );

          if (uploadResult.url) {
            await createTicketAttachment({
              ticketMessageId: ticketMessage.id,
              fileName: file.name,
              fileUrl: uploadResult.url,
              fileType: file.type,
              fileSize: file.size.toString(),
            });
          }
        }
      }
    }

    if (user.role === "ADMIN" && ticket.user) {
      try {
        await notifyUserAdminResponse({
          userEmail: ticket.user.email,
          userName: ticket.user.name,
          ticketNumber: ticket.ticketNumber,
          ticketTitle: ticket.title,
          adminName: user.name,
          message: message,
          ticketId: ticketId,
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de notificação:", emailError);
      }
    }

    revalidatePath(`/tickets/${ticketId}`);
    return { success: true, messageId: ticketMessage.id };
  } catch (error) {
    return {
      error: "Erro ao enviar mensagem. Tente novamente.",
      messageId: null,
    };
  }
}
