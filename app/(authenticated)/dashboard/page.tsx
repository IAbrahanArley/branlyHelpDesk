import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { getTicketsByUserId } from "@/src/db/queries/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const tickets = await getTicketsByUserId(user.id);
  const openTickets = tickets.filter(
    ({ ticket }) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user.name}!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/tickets">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Meus Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{tickets.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total de tickets criados
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tickets?status=open">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Tickets Abertos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{openTickets}</p>
                <p className="text-sm text-muted-foreground">
                  Tickets em andamento
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tickets/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Criar Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Abra um novo chamado
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Role:</span> {user.role}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

