import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { ticketMessages } from "./ticket-messages";

export const ticketAttachments = pgTable("ticket_attachments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  ticketMessageId: text("ticket_message_id")
    .notNull()
    .references(() => ticketMessages.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: text("file_size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ticketAttachmentsRelations = relations(
  ticketAttachments,
  ({ one }) => ({
    ticketMessage: one(ticketMessages, {
      fields: [ticketAttachments.ticketMessageId],
      references: [ticketMessages.id],
    }),
  })
);

export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type NewTicketAttachment = typeof ticketAttachments.$inferInsert;
