"use client";

import { Menu } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSidebar } from "@/src/contexts/sidebar-context";

export function MobileHeader() {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 lg:hidden">
      <Button variant="ghost" size="icon" onClick={toggle}>
        <Menu className="h-6 w-6" />
      </Button>
      <h1 className="ml-4 text-lg font-bold">Help Desk</h1>
    </header>
  );
}

