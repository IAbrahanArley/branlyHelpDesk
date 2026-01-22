import { redirect } from "next/navigation";
import { getCurrentUser, requireAdmin } from "@/src/lib/auth/helpers";
import { getAllTickets } from "@/src/db/queries/tickets";
import { getAllAdmins } from "@/src/db/queries/users";
import { TicketStatus, TicketPriority } from "@/src/db/schema/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { AdminTicketsTable } from "./admin-tickets-table";

const statusLabels = {
  [TicketStatus.OPEN]: "Aberto",
  [TicketStatus.IN_PROGRESS]: "Em Andamento",
  [TicketStatus.WAITING]: "Aguardando",
  [TicketStatus.RESOLVED]: "Resolvido",
  [TicketStatus.CLOSED]: "Fechado",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await requireAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const allTickets = await getAllTickets();
  const admins = await getAllAdmins();

  const openTickets = allTickets.filter(
    ({ ticket }) => ticket.status === TicketStatus.OPEN
  ).length;

  const inProgressTickets = allTickets.filter(
    ({ ticket }) => ticket.status === TicketStatus.IN_PROGRESS
  ).length;

  const waitingTickets = allTickets.filter(
    ({ ticket }) => ticket.status === TicketStatus.WAITING
  ).length;

  const resolvedTickets = allTickets.filter(
    ({ ticket }) => ticket.status === TicketStatus.RESOLVED
  ).length;

  const closedTickets = allTickets.filter(
    ({ ticket }) => ticket.status === TicketStatus.CLOSED
  ).length;

  const urgentTickets = allTickets.filter(
    ({ ticket }) => ticket.priority === TicketPriority.URGENT
  ).length;

  const unassignedTickets = allTickets.filter(
    ({ ticket }) => !ticket.assignedAdminId
  ).length;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie todos os tickets do sistema
          </p>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tickets Abertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{openTickets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{inProgressTickets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Urgentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{urgentTickets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sem Atribuição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{unassignedTickets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aguardando
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{waitingTickets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolvidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{resolvedTickets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fechados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{closedTickets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{allTickets.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos os Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTicketsTable tickets={allTickets} admins={admins} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

