import { pgEnum } from "drizzle-orm/pg-core";
import { TicketStatus, TicketPriority, UserRole } from "./enums";

export const ticketStatusEnum = pgEnum("ticket_status", [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
  TicketStatus.WAITING,
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.URGENT,
]);

export const userRoleEnum = pgEnum("user_role", [
  UserRole.USER,
  UserRole.ADMIN,
]);

