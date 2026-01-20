"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateTicketStatusAction, assignTicketAction } from "@/src/lib/actions/admin";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";
import { TicketStatus, TicketPriority } from "@/src/db/schema/enums";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculateSLAStatus, formatSLAStatus } from "@/src/lib/sla/helpers";

const statusLabels = {
  [TicketStatus.OPEN]: "Aberto",
  [TicketStatus.IN_PROGRESS]: "Em Andamento",
  [TicketStatus.WAITING]: "Aguardando",
  [TicketStatus.RESOLVED]: "Resolvido",
  [TicketStatus.CLOSED]: "Fechado",
};

const priorityLabels = {
  [TicketPriority.LOW]: "Baixa",
  [TicketPriority.MEDIUM]: "Média",
  [TicketPriority.HIGH]: "Alta",
  [TicketPriority.URGENT]: "Urgente",
};

const statusColors = {
  [TicketStatus.OPEN]: "bg-blue-100 text-blue-800",
  [TicketStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [TicketStatus.WAITING]: "bg-orange-100 text-orange-800",
  [TicketStatus.RESOLVED]: "bg-green-100 text-green-800",
  [TicketStatus.CLOSED]: "bg-gray-100 text-gray-800",
};

const priorityColors = {
  [TicketPriority.LOW]: "bg-gray-100 text-gray-800",
  [TicketPriority.MEDIUM]: "bg-blue-100 text-blue-800",
  [TicketPriority.HIGH]: "bg-orange-100 text-orange-800",
  [TicketPriority.URGENT]: "bg-red-100 text-red-800",
};

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  userId: string;
  assignedAdminId: string | null;
  slaHours: number | null;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminTicketsTableProps {
  tickets: Array<{
    ticket: Ticket;
    user: User | null;
    assignedAdmin: User | null;
  }>;
  admins: User[];
}

export function AdminTicketsTable({ tickets, admins }: AdminTicketsTableProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("ticketId", ticketId);
      formData.append("status", newStatus);

      const result = await updateTicketStatusAction(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleAssignChange = (ticketId: string, adminId: string | null) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("ticketId", ticketId);
      if (adminId) {
        formData.append("adminId", adminId);
      }

      const result = await assignTicketAction(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum ticket encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium">ID</th>
              <th className="text-left p-4 font-medium">Título</th>
              <th className="text-left p-4 font-medium">Usuário</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Prioridade</th>
              <th className="text-left p-4 font-medium">SLA</th>
              <th className="text-left p-4 font-medium">Atribuído a</th>
              <th className="text-left p-4 font-medium">Criado em</th>
              <th className="text-left p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(({ ticket, user, assignedAdmin }) => (
              <tr key={ticket.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="text-primary hover:underline font-mono text-sm"
                  >
                    #{ticket.ticketNumber}
                  </Link>
                </td>
                <td className="p-4">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="font-medium hover:underline"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {user?.name || "Usuário"}
                </td>
                <td className="p-4">
                  <Select
                    value={ticket.status}
                    onChange={(e) =>
                      handleStatusChange(ticket.id, e.target.value as TicketStatus)
                    }
                    disabled={isPending}
                    className="text-xs"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority as TicketPriority]}`}
                  >
                    {priorityLabels[ticket.priority as TicketPriority]}
                  </span>
                </td>
                <td className="p-4">
                  {(() => {
                    const slaStatus = calculateSLAStatus(
                      new Date(ticket.createdAt),
                      ticket.slaHours || 24,
                      ticket.firstResponseAt ? new Date(ticket.firstResponseAt) : null,
                      ticket.resolvedAt ? new Date(ticket.resolvedAt) : null
                    );
                    const formatted = formatSLAStatus(slaStatus.resolutionStatus);
                    return (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${formatted.color}`}
                        title={`SLA: ${ticket.slaHours || 24}h`}
                      >
                        {formatted.label}
                      </span>
                    );
                  })()}
                </td>
                <td className="p-4">
                  <Select
                    value={assignedAdmin?.id || ""}
                    onChange={(e) =>
                      handleAssignChange(
                        ticket.id,
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    disabled={isPending}
                    className="text-xs"
                  >
                    <option value="">Sem atribuição</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </td>
                <td className="p-4">
                  <Link href={`/tickets/${ticket.id}`}>
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
