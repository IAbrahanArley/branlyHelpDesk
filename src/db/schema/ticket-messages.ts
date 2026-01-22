import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { tickets } from "./tickets";
import { users } from "./users";
import { ticketAttachments } from "./ticket-attachments";

export const ticketMessages = pgTable("ticket_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ticketMessagesRelations = relations(
  ticketMessages,
  ({ one, many }) => ({
    ticket: one(tickets, {
      fields: [ticketMessages.ticketId],
      references: [tickets.id],
    }),
    user: one(users, {
      fields: [ticketMessages.userId],
      references: [users.id],
    }),
    attachments: many(ticketAttachments),
  })
);

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type NewTicketMessage = typeof ticketMessages.$inferInsert;

