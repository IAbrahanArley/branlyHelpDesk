import { z } from "zod";
import { TicketStatus, TicketPriority } from "@/src/db/schema/enums";

export const createTicketSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(200, "Título deve ter no máximo 200 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres").max(5000, "Descrição deve ter no máximo 5000 caracteres"),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
});

export const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
  ticketId: z.string().min(1, "ID do ticket é obrigatório"),
});

export const assignTicketSchema = z.object({
  ticketId: z.string().min(1, "ID do ticket é obrigatório"),
  adminId: z.string().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
