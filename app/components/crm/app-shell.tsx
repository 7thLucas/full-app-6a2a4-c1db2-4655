import { NavLink } from "react-router";
import { LayoutDashboard, Users, KanbanSquare } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { cn } from "~/lib/utils";

const NAV = [
  { to: "/", label: "Today", icon: LayoutDashboard, end: true },
  { to: "/contacts", label: "Contacts", icon: Users, end: false },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare, end: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { config } = useConfigurables();
  const appName = config?.appName && !String(config.appName).startsWith("FILL_") ? config.appName : "Pipeline";
  const logoUrl = config?.logoUrl && !String(config.logoUrl).startsWith("FILL_") ? config.logoUrl : "";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt={String(appName)} className="h-7 w-7 rounded-md object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[13px] font-bold text-white">
                {String(appName).charAt(0)}
              </div>
            )}
            <span className="text-[15px] font-semibold tracking-tight">{appName}</span>
          </div>

          <nav className="ml-4 flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
