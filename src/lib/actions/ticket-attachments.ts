"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { uploadFileToStorage } from "@/src/lib/storage/upload";
import { createTicketAttachment } from "@/src/db/mutations/ticket-attachments";
import { getTicketById } from "@/src/db/queries/tickets";

export async function uploadTicketAttachmentAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; attachmentId?: string }> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: "Você precisa estar autenticado para fazer upload de arquivos",
    };
  }

  const file = formData.get("file") as File;
  const ticketId = formData.get("ticketId") as string;
  const messageId = formData.get("messageId") as string;

  if (!file || !ticketId || !messageId) {
    return {
      success: false,
      error: "Dados inválidos",
    };
  }

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    return {
      success: false,
      error: "Ticket não encontrado",
    };
  }

  if (ticket.userId !== user.id && user.role !== "ADMIN") {
    return {
      success: false,
      error: "Você não tem permissão para fazer upload neste ticket",
    };
  }

  if (ticket.status === "CLOSED") {
    return {
      success: false,
      error: "Não é possível fazer upload em tickets fechados",
    };
  }

  try {
    const uploadResult = await uploadFileToStorage(file, ticketId, messageId);

    if (uploadResult.error || !uploadResult.url) {
      return {
        success: false,
        error: uploadResult.error || "Erro ao fazer upload do arquivo",
      };
    }

    const attachment = await createTicketAttachment({
      ticketMessageId: messageId,
      fileName: file.name,
      fileUrl: uploadResult.url,
      fileType: file.type,
      fileSize: file.size.toString(),
    });

    revalidatePath(`/tickets/${ticketId}`);
    return {
      success: true,
      attachmentId: attachment.id,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao fazer upload do arquivo. Tente novamente.",
    };
  }
}
