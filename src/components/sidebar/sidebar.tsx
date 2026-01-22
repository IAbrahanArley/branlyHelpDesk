"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  LogOut,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { signOut } from "@/src/lib/auth/actions";
import { useSidebar } from "@/src/contexts/sidebar-context";

interface SidebarProps {
  userRole: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Meus Tickets",
    href: "/tickets",
    icon: Ticket,
  },
  {
    name: "Novo Ticket",
    href: "/tickets/new",
    icon: PlusCircle,
  },
];

const adminNavigation = [
  {
    name: "Admin",
    href: "/admin",
    icon: User,
  },
];

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebar();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 lg:relative lg:bg-card",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-16",
          "shadow-lg lg:shadow-none"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          {isOpen && <h1 className="text-xl font-bold">Help Desk</h1>}
          {!isOpen && (
            <div className="w-full flex justify-center">
              <h1 className="text-lg font-bold">HD</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
          {isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="hidden lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {!isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="hidden lg:flex absolute -right-3 top-16 bg-card border border-r-0 rounded-r-md shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  close();
                }
              }}
              title={!isOpen ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isOpen ? "justify-start" : "justify-center lg:px-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}

        {userRole === "ADMIN" && (
          <>
            <div className="my-4 border-t" />
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      close();
                    }
                  }}
                  title={!isOpen ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isOpen ? "justify-start" : "justify-center lg:px-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t p-4">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className={cn(
              "w-full gap-3",
              isOpen ? "justify-start" : "justify-center lg:px-2"
            )}
            title={!isOpen ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span>Sair</span>}
          </Button>
        </form>
      </div>
    </aside>
    </>
  );
}

