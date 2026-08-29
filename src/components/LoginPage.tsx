import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authContext";
import { supabase } from "../lib/supabase";
import { LayoutDashboard, LogIn, AlertCircle } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: unknown) {
      const description = error instanceof Error ? error.message : "Não foi possível entrar.";
      setMsg(description);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto">
             <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">PrevRural</h1>
          <p className="text-muted-foreground">Gestão de processos e documentos previdenciários rurais.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4" aria-busy={loading}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">E-mail profissional</label>
            <input 
              id="email"
              name="email"
              type="email" 
              required
              autoComplete="email"
              disabled={loading}
              className="w-full bg-secondary/30 border border-input rounded-xl p-3 outline-none focus:border-primary transition-colors"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Senha</label>
            <input 
              id="password"
              name="password"
              type="password" 
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full bg-secondary/30 border border-input rounded-xl p-3 outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {msg && (
            <div role="alert" className="p-3 bg-secondary/50 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={14} />
              {msg}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar no sistema"}
            {!loading && <LogIn size={18} />}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          O acesso é disponibilizado pelo administrador do escritório.
        </p>

      </div>
    </div>
  );
}
