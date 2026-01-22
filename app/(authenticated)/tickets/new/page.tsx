import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { CreateTicketForm } from "./create-ticket-form";

export default async function NewTicketPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Novo Ticket</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Crie um novo chamado descrevendo seu problema
          </p>
        </div>

        <CreateTicketForm />
      </div>
    </div>
  );
}

