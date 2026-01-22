import { db } from "@/src/db";
import { ticketAttachments } from "@/src/db/schema/ticket-attachments";

export async function createTicketAttachment(data: {
  ticketMessageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
}) {
  const [attachment] = await db
    .insert(ticketAttachments)
    .values({
      ticketMessageId: data.ticketMessageId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
    })
    .returning();

  return attachment;
}

