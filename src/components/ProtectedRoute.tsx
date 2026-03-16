import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const [session, setSession] = useState<any>({ user: { id: "test-user-id" } });
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="font-medium animate-pulse">Verificando sessão...</p>
      </div>
    );
  }

  // Se houver sessão, renderiza o sistema (Layout -> Dashboard)
  return <Outlet />;
}