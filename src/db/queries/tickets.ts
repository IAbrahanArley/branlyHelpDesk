import { db } from "@/src/db";
import { tickets, users } from "@/src/db/schema";
import { ticketMessages } from "@/src/db/schema/ticket-messages";
import { ticketAttachments } from "@/src/db/schema/ticket-attachments";
import { ticketStatusHistory } from "@/src/db/schema/ticket-status-history";
import { eq, desc, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { TicketStatus } from "@/src/db/schema/enums";

const assignedAdmin = alias(users, "assigned_admin");

export async function getTicketById(id: string) {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return null;
  }

  const [result] = await db
    .select({
      ticket: tickets,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      assignedAdmin: {
        id: assignedAdmin.id,
        name: assignedAdmin.name,
        email: assignedAdmin.email,
      },
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.userId, users.id))
    .leftJoin(assignedAdmin, eq(tickets.assignedAdminId, assignedAdmin.id))
    .where(eq(tickets.id, id))
    .limit(1);

  if (!result) {
    return null;
  }

  const messagesData = await db
    .select({
      message: ticketMessages,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(ticketMessages)
    .leftJoin(users, eq(ticketMessages.userId, users.id))
    .where(eq(ticketMessages.ticketId, id))
    .orderBy(asc(ticketMessages.createdAt));

  const messages = await Promise.all(
    messagesData.map(async (m) => {
      const attachments = await db
        .select()
        .from(ticketAttachments)
        .where(eq(ticketAttachments.ticketMessageId, m.message.id));

      return {
        ...m.message,
        user: m.user,
        attachments,
      };
    })
  );

  const history = await db
    .select()
    .from(ticketStatusHistory)
    .where(eq(ticketStatusHistory.ticketId, id))
    .orderBy(desc(ticketStatusHistory.createdAt));

  return {
    ...result.ticket,
    user: result.user,
    assignedAdmin: result.assignedAdmin,
    messages,
    statusHistory: history,
  };
}

export async function getTicketsByUserId(userId: string) {
  return await db
    .select({
      ticket: tickets,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      assignedAdmin: {
        id: assignedAdmin.id,
        name: assignedAdmin.name,
        email: assignedAdmin.email,
      },
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.userId, users.id))
    .leftJoin(assignedAdmin, eq(tickets.assignedAdminId, assignedAdmin.id))
    .where(eq(tickets.userId, userId))
    .orderBy(desc(tickets.createdAt));
}

export async function getAllTickets() {
  return await db
    .select({
      ticket: tickets,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      assignedAdmin: {
        id: assignedAdmin.id,
        name: assignedAdmin.name,
        email: assignedAdmin.email,
      },
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.userId, users.id))
    .leftJoin(assignedAdmin, eq(tickets.assignedAdminId, assignedAdmin.id))
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketsByStatus(status: TicketStatus) {
  return await db
    .select({
      ticket: tickets,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      assignedAdmin: {
        id: assignedAdmin.id,
        name: assignedAdmin.name,
        email: assignedAdmin.email,
      },
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.userId, users.id))
    .leftJoin(assignedAdmin, eq(tickets.assignedAdminId, assignedAdmin.id))
    .where(eq(tickets.status, status))
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketsByAdminId(adminId: string) {
  return await db
    .select({
      ticket: tickets,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      assignedAdmin: {
        id: assignedAdmin.id,
        name: assignedAdmin.name,
        email: assignedAdmin.email,
      },
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.userId, users.id))
    .leftJoin(assignedAdmin, eq(tickets.assignedAdminId, assignedAdmin.id))
    .where(eq(tickets.assignedAdminId, adminId))
    .orderBy(desc(tickets.createdAt));
}
