import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { TicketStatus, TicketPriority } from "./enums";
import { ticketStatusEnum, ticketPriorityEnum } from "./pg-enums";
import { users } from "./users";
import { ticketMessages } from "./ticket-messages";
import { ticketStatusHistory } from "./ticket-status-history";

export const tickets = pgTable("tickets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  ticketNumber: text("ticket_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default(TicketStatus.OPEN),
  priority: ticketPriorityEnum("priority")
    .notNull()
    .default(TicketPriority.MEDIUM),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignedAdminId: text("assigned_admin_id").references(() => users.id, {
    onDelete: "set null",
  }),
  slaHours: integer("sla_hours").notNull().default(24),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  assignedAdmin: one(users, {
    fields: [tickets.assignedAdminId],
    references: [users.id],
  }),
  messages: many(ticketMessages),
  statusHistory: many(ticketStatusHistory),
}));

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
