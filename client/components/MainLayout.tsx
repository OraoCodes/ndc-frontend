import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 px-4 py-2 bg-background text-foreground text-sm rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">Jane Doe</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
