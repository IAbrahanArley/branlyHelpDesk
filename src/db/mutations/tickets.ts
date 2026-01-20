import { db } from "@/src/db";
import { tickets, ticketStatusHistory } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { TicketStatus, TicketPriority } from "@/src/db/schema/enums";
import { getSLAHours } from "@/src/lib/sla/helpers";

export async function generateTicketNumber(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

export async function createTicket(data: {
  ticketNumber: string;
  title: string;
  description: string;
  priority: string;
  userId: string;
}) {
  try {
    const slaHours = getSLAHours(data.priority as TicketPriority);

    const [ticket] = await db
      .insert(tickets)
      .values({
        ticketNumber: data.ticketNumber,
        title: data.title,
        description: data.description,
        priority: data.priority as any,
        userId: data.userId,
        slaHours,
      })
      .returning();

    if (!ticket) {
      throw new Error("Falha ao criar ticket: nenhum registro retornado");
    }

    await db.insert(ticketStatusHistory).values({
      ticketId: ticket.id,
      oldStatus: null,
      newStatus: TicketStatus.OPEN,
      changedBy: data.userId,
    });

    return ticket;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao criar ticket: ${error.message}`);
    }
    throw error;
  }
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  oldStatus: TicketStatus | null,
  changedBy: string
) {
  const updateData: {
    status: TicketStatus;
    updatedAt: Date;
    resolvedAt?: Date;
  } = {
    status: newStatus,
    updatedAt: new Date(),
  };

  if (newStatus === TicketStatus.RESOLVED || newStatus === TicketStatus.CLOSED) {
    updateData.resolvedAt = new Date();
  }

  const [updatedTicket] = await db
    .update(tickets)
    .set(updateData)
    .where(eq(tickets.id, ticketId))
    .returning();

  await db.insert(ticketStatusHistory).values({
    ticketId,
    oldStatus,
    newStatus,
    changedBy,
  });

  return updatedTicket;
}

export async function assignTicketToAdmin(
  ticketId: string,
  adminId: string | null
) {
  const [updatedTicket] = await db
    .update(tickets)
    .set({
      assignedAdminId: adminId,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId))
    .returning();

  return updatedTicket;
}
