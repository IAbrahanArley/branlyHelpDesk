"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/lib/auth/helpers";
import { updateTicketStatusSchema, assignTicketSchema } from "@/src/lib/validators/ticket";
import {
  updateTicketStatus,
  assignTicketToAdmin,
} from "@/src/db/mutations/tickets";
import { getTicketById } from "@/src/db/queries/tickets";
import { TicketStatus } from "@/src/db/schema/enums";
import { notifyTicketResolved } from "@/src/lib/email/notifications";

export async function updateTicketStatusAction(formData: FormData) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return {
        error: "Acesso negado. Apenas administradores podem atualizar status de tickets.",
      };
    }

    const ticketId = formData.get("ticketId");
    const status = formData.get("status");

    if (!ticketId || !status) {
      return {
        error: "Ticket ID e status são obrigatórios",
      };
    }

    const validation = updateTicketStatusSchema.safeParse({
      ticketId: ticketId.toString(),
      status: status.toString(),
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return {
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }

    const ticket = await getTicketById(validation.data.ticketId);

    if (!ticket) {
      return {
        error: "Ticket não encontrado",
      };
    }

    await updateTicketStatus(
      validation.data.ticketId,
      validation.data.status,
      ticket.status as TicketStatus,
      admin.id
    );

    if (
      (validation.data.status === TicketStatus.RESOLVED ||
        validation.data.status === TicketStatus.CLOSED) &&
      ticket.user
    ) {
      try {
        await notifyTicketResolved({
          userEmail: ticket.user.email,
          userName: ticket.user.name,
          ticketNumber: ticket.ticketNumber,
          ticketTitle: ticket.title,
          ticketId: validation.data.ticketId,
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de notificação:", emailError);
      }
    }

    revalidatePath("/admin");
    revalidatePath(`/tickets/${validation.data.ticketId}`);

    return {
      success: true,
    };
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

    let errorMessage = "Erro ao atualizar status do ticket. Tente novamente.";

    if (error instanceof Error) {
      errorMessage = `Erro ao atualizar status: ${error.message}`;
    }

    return {
      error: errorMessage,
    };
  }
}

export async function assignTicketAction(formData: FormData) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return {
        error: "Acesso negado. Apenas administradores podem atribuir tickets.",
      };
    }

    const ticketId = formData.get("ticketId");
    const adminId = formData.get("adminId");

    if (!ticketId) {
      return {
        error: "Ticket ID é obrigatório",
      };
    }

    const adminIdValue = adminId && adminId.toString() !== "" ? adminId.toString() : null;

    if (!adminIdValue) {
      await assignTicketToAdmin(ticketId.toString(), null);
      revalidatePath("/admin");
      revalidatePath(`/tickets/${ticketId.toString()}`);
      return {
        success: true,
      };
    }

    const validation = assignTicketSchema.safeParse({
      ticketId: ticketId.toString(),
      adminId: adminIdValue,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return {
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }

    await assignTicketToAdmin(validation.data.ticketId, validation.data.adminId || null);

    revalidatePath("/admin");
    revalidatePath(`/tickets/${validation.data.ticketId}`);

    return {
      success: true,
    };
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

    let errorMessage = "Erro ao atribuir ticket. Tente novamente.";

    if (error instanceof Error) {
      errorMessage = `Erro ao atribuir ticket: ${error.message}`;
    }

    return {
      error: errorMessage,
    };
  }
}
