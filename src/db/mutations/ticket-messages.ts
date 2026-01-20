import { db } from "@/src/db";
import { ticketMessages, tickets } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function createTicketMessage(data: {
  ticketId: string;
  userId: string;
  message: string;
}) {
  const [ticket] = await db
    .select({ firstResponseAt: tickets.firstResponseAt })
    .from(tickets)
    .where(eq(tickets.id, data.ticketId))
    .limit(1);

  const isFirstResponse = !ticket?.firstResponseAt;

  const [message] = await db
    .insert(ticketMessages)
    .values({
      ticketId: data.ticketId,
      userId: data.userId,
      message: data.message,
    })
    .returning();

  const updateData: {
    updatedAt: Date;
    firstResponseAt?: Date;
  } = {
    updatedAt: new Date(),
  };

  if (isFirstResponse) {
    updateData.firstResponseAt = new Date();
  }

  await db
    .update(tickets)
    .set(updateData)
    .where(eq(tickets.id, data.ticketId));

  return message;
}
