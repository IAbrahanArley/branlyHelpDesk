import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { ticketStatusEnum } from "./pg-enums";
import { tickets } from "./tickets";
import { users } from "./users";

export const ticketStatusHistory = pgTable("ticket_status_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  oldStatus: ticketStatusEnum("old_status"),
  newStatus: ticketStatusEnum("new_status").notNull(),
  changedBy: text("changed_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ticketStatusHistoryRelations = relations(
  ticketStatusHistory,
  ({ one }) => ({
    ticket: one(tickets, {
      fields: [ticketStatusHistory.ticketId],
      references: [tickets.id],
    }),
    changedByUser: one(users, {
      fields: [ticketStatusHistory.changedBy],
      references: [users.id],
    }),
  })
);

export type TicketStatusHistory = typeof ticketStatusHistory.$inferSelect;
export type NewTicketStatusHistory =
  typeof ticketStatusHistory.$inferInsert;
