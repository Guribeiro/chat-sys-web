import { NavLink, Outlet, useParams } from "react-router";
import { Settings, Users } from "lucide-react";

import { cn } from "@/lib/utils";

export function ChannelDetailsPage() {
  const { slug } = useParams()

  const tabs = [
    { to: `/admin/channels/${slug}/members`, label: 'Membros', icon: Users },
    { to: `/admin/channels/${slug}/settings`, label: 'Configurações', icon: Settings },
  ]

  return (
    <div>
      <nav aria-label="Seções do canal" className="mb-8 flex gap-1 border-b">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              '-mb-px flex h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
              isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
