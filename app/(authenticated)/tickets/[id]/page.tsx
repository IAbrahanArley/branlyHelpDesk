import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { getTicketById } from "@/src/db/queries/tickets";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { TicketStatus, TicketPriority } from "@/src/db/schema/enums";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChatForm } from "./chat-form";
import { MessageAttachments } from "./message-attachments";
import { SLAIndicator } from "./sla-indicator";

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

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await Promise.resolve(params);
  
  if (!resolvedParams.id) {
    notFound();
  }

  const ticket = await getTicketById(resolvedParams.id);

  if (!ticket) {
    notFound();
  }

  if (ticket.userId !== user.id && user.role !== "ADMIN") {
    redirect("/tickets");
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/tickets"
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
            >
              ← Voltar para tickets
            </Link>
            <h1 className="text-3xl font-bold">{ticket.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ticket #{ticket.ticketNumber}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status as TicketStatus]}`}
            >
              {statusLabels[ticket.status as TicketStatus]}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[ticket.priority as TicketPriority]}`}
            >
              {priorityLabels[ticket.priority as TicketPriority]}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {ticket.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mensagens</CardTitle>
              </CardHeader>
              <CardContent>
                {ticket.messages && ticket.messages.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto mb-4">
                    {ticket.messages.map((message) => {
                        const isCurrentUser = (message as any).user?.id === user.id;
                        return (
                          <div
                            key={message.id}
                            className={`pb-4 last:pb-0 ${
                              isCurrentUser ? "text-right" : "text-left"
                            }`}
                          >
                            <div
                              className={`inline-block max-w-[80%] rounded-lg p-4 ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  {isCurrentUser
                                    ? "Você"
                                    : (message as any).user?.name || "Usuário"}
                                </span>
                                <span
                                  className={`text-xs ml-2 ${
                                    isCurrentUser
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {format(
                                    new Date(message.createdAt),
                                    "HH:mm",
                                    { locale: ptBR }
                                  )}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap break-words">
                                {message.message}
                              </p>
                              {(message as any).attachments &&
                                (message as any).attachments.length > 0 && (
                                  <MessageAttachments
                                    attachments={(message as any).attachments}
                                  />
                                )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4">
                    Nenhuma mensagem ainda. Use o chat abaixo para enviar uma
                    mensagem.
                  </p>
                )}
              </CardContent>
            </Card>

            {ticket.status !== "CLOSED" && (
              <ChatForm ticketId={ticket.id} />
            )}

            {ticket.status === "CLOSED" && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Este ticket está fechado. Não é possível enviar novas mensagens.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Criado em</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ticket.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Última atualização</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ticket.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Criado por</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.user?.name || "Usuário"}
                  </p>
                </div>
                {ticket.assignedAdmin && (
                  <div>
                    <p className="text-sm font-medium">Atribuído a</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.assignedAdmin.name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-2">SLA de Resposta</p>
                  <SLAIndicator
                    createdAt={ticket.createdAt}
                    slaHours={ticket.slaHours || 24}
                    firstResponseAt={ticket.firstResponseAt}
                    resolvedAt={ticket.resolvedAt}
                    type="response"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">SLA de Resolução</p>
                  <SLAIndicator
                    createdAt={ticket.createdAt}
                    slaHours={ticket.slaHours || 24}
                    firstResponseAt={ticket.firstResponseAt}
                    resolvedAt={ticket.resolvedAt}
                    type="resolution"
                  />
                </div>
                {ticket.firstResponseAt && (
                  <div>
                    <p className="text-sm font-medium">Primeira resposta em</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ticket.firstResponseAt), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}
                {ticket.resolvedAt && (
                  <div>
                    <p className="text-sm font-medium">Resolvido em</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ticket.resolvedAt), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {ticket.statusHistory && ticket.statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ticket.statusHistory.map((history) => (
                      <div key={history.id} className="border-l-2 pl-3 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {history.oldStatus
                              ? `${statusLabels[history.oldStatus as TicketStatus]} → ${statusLabels[history.newStatus as TicketStatus]}`
                              : statusLabels[history.newStatus as TicketStatus]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(history.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR }
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
