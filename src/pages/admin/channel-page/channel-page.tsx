import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import { Link, Outlet, useLocation, useParams } from "react-router";

export function ChannelDetailsPage() {
  const { slug } = useParams()
  const location = useLocation()
  const pathname = location.pathname

  return (
    <div className="space-y-2">
      <div className="flex gap-1 justify-end">
        <Button asChild variant={'outline'} className={`text-foreground ${pathname.includes('/members') && 'border-green-500'}`}>
          <Link to={`/admin/channels/${slug}/members`}>
            <Users className="w-4 h-4" />
            <p className='hidden lg:flex'>Ver membros</p>
          </Link>
        </Button>
        <Button asChild variant={'outline'} className={`text-foreground ${pathname.includes('/settings') && 'border-green-500'}`}>
          <Link to={`/admin/channels/${slug}/settings`}>
            <Settings className="w-4 h-4" />
            <p className='hidden lg:flex'>Configurações</p>
          </Link>
        </Button>
      </div>
      <div className="pt-6 pb-2">
        <Outlet />
      </div>
    </div>
  )
}