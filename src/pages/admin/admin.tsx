import { Link, Outlet } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export const Admin = () => {
  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="mb-6">
          <Link to="/channels" className="inline-flex items-center text-green-600 hover:text-green-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-md lg:text-3xl font-bold text-foreground mb-2">Canal do administrador</h1>
              <p className="text-foreground/50">Gerencie todos os canais e seus membros</p>
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
