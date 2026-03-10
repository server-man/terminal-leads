import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Zap, Shield } from "lucide-react";

export function ProtectedLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background scanline">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-primary" />
              <Zap className="h-5 w-5 text-primary neon-glow" />
              <h1 className="font-display text-lg font-bold text-foreground neon-glow tracking-tight hidden sm:block">
                LEADGEN_OS
              </h1>
              <span className="text-xs text-muted-foreground hidden sm:block">v2.1.0</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">SECURE SESSION</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
