import { Link, Outlet, useLocation } from 'react-router';
import { ArrowLeft, Hash } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { slugToOriginalText } from '@/lib/utils';
import { useMemo } from 'react';

export const Admin = () => {
  const location = useLocation();

  const currentPathname = location.pathname;

  const prefix = "/admin/channels";

  const [, currentPath] = currentPathname.split(`${prefix}/`);

  const slug = useMemo(() => {
    if (currentPath) {
      const [slug] = currentPath.split("/");

      return slug
    }
  }, [currentPath])

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="mb-6">
          <div className='py-4'>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild >
                    <Link to="/channels">Canais</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem >
                  <BreadcrumbLink className={currentPathname === prefix ? 'font-medium text-green-500 animate-pulse hover:text-green-400 hover:animate-none' : ''} asChild>
                    <Link to="/admin/channels">
                      Canal do administrador
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {currentPath && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className='font-medium text-green-500 animate-pulse hover:text-green-700'>
                      <BreadcrumbLink>{slugToOriginalText(slug)}</BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}

              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {slug ? (
                <h1 className="text-md lg:text-3xl font-bold text-foreground mb-2">{slugToOriginalText(slug)}</h1>
              ) : (
                <h1 className="text-md lg:text-3xl font-bold text-foreground mb-2">Canal do administrador</h1>
              )}
              <p className="text-foreground/50 text-sm lg:text-base">Gerencie todos os canais e seus membros</p>
            </div>
          </div>
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
