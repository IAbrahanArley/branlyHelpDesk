import { z } from "zod";

export const createTicketMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Mensagem não pode estar vazia")
    .max(5000, "Mensagem deve ter no máximo 5000 caracteres"),
  ticketId: z.string().min(1, "ID do ticket é obrigatório"),
});

export type CreateTicketMessageInput = z.infer<typeof createTicketMessageSchema>;
