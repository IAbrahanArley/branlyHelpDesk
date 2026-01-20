import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { getTicketsByUserId } from "@/src/db/queries/tickets";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { TicketStatus, TicketPriority } from "@/src/db/schema/enums";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export default async function TicketsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const tickets = await getTicketsByUserId(user.id);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meus Tickets</h1>
            <p className="mt-2 text-muted-foreground">
              Visualize e gerencie seus chamados
            </p>
          </div>
          <Link href="/tickets/new">
            <Button>Novo Ticket</Button>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Você ainda não criou nenhum ticket
              </p>
              <Link href="/tickets/new">
                <Button>Criar Primeiro Ticket</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map(({ ticket, assignedAdmin }) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {ticket.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status as TicketStatus]}`}
                        >
                          {statusLabels[ticket.status as TicketStatus]}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority as TicketPriority]}`}
                        >
                          {priorityLabels[ticket.priority as TicketPriority]}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          #{ticket.ticketNumber}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(ticket.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                    {assignedAdmin && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Atribuído a: {assignedAdmin.name}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
