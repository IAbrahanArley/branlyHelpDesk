import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { Sidebar } from "@/src/components/sidebar/sidebar";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
