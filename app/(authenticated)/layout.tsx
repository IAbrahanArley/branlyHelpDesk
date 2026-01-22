import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { Sidebar } from "@/src/components/sidebar/sidebar";
import { SidebarProvider } from "@/src/contexts/sidebar-context";
import { MobileHeader } from "@/src/components/header/mobile-header";

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
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar userRole={user.role} />
        <main className="flex-1 overflow-y-auto">
          <MobileHeader />
          <div className="min-h-[calc(100vh-4rem)] lg:min-h-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

