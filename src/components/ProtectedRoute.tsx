import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

export function ProtectedRoute() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Busca a sessão atual
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          setLoading(false); // Liberta o ecrã se der sucesso
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        if (mounted) {
          setSession(null);
          setLoading(false); // CRUCIAL: Liberta o ecrã mesmo se a internet falhar ou der "Failed to fetch"
        }
      }
    };

    void checkSession();

    // 2. Fica à escuta de mudanças (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false); // CRUCIAL: Liberta o ecrã após o login
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
        <Loader2 className="animate-spin text-brand" size={40} />
        <p className="font-medium animate-pulse">Verificando sessão...</p>
      </div>
    );
  }

  // Se não estiver a carregar e não houver sessão, manda para o Login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se houver sessão, renderiza o sistema (Layout -> Dashboard)
  return <Outlet />;
}
