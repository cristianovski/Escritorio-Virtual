import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/authContext";
import { supabase } from "../lib/supabase";

function getFriendlyAuthMessage(error: unknown) {
  const code = (
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : ""
  ).toLowerCase();
  const technicalMessage = error instanceof Error ? error.message.toLowerCase() : "";

  if (code === "invalid_credentials" || technicalMessage.includes("invalid login credentials")) {
    return "E-mail ou senha não conferem. Revise os dados e tente novamente.";
  }

  if (code === "email_not_confirmed" || technicalMessage.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Consulte o administrador do escritório.";
  }

  if (
    code.includes("rate_limit") ||
    technicalMessage.includes("too many requests") ||
    technicalMessage.includes("rate limit")
  ) {
    return "Houve muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }

  if (
    technicalMessage.includes("failed to fetch") ||
    technicalMessage.includes("network") ||
    technicalMessage.includes("fetch")
  ) {
    return "Não foi possível conectar ao serviço. Verifique sua internet e tente novamente.";
  }

  return "Não foi possível entrar agora. Tente novamente ou consulte o administrador do escritório.";
}

export function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
    } catch (error: unknown) {
      setMsg(getFriendlyAuthMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-[-8rem] h-80 w-80 rounded-full bg-brand/5 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 right-[-8rem] h-96 w-96 rounded-full bg-navy/5 blur-3xl" aria-hidden="true" />

      <section className="relative w-full max-w-[27rem] rounded-[1.75rem] bg-card/[0.92] p-6 shadow-panel ring-1 ring-black/[0.045] backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-3" aria-label="PrevRural">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xs font-semibold tracking-[0.06em] text-primary ring-1 ring-black/[0.035]">
            PR
          </span>
          <span>
            <span className="block text-base font-semibold leading-tight tracking-[-0.02em] text-foreground">PrevRural</span>
            <span className="block text-xs text-muted-foreground">Gestão previdenciária</span>
          </span>
        </div>

        <div className="mb-8 mt-10">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.035em] text-foreground">Acesse sua conta</h1>
          <p className="mt-2 text-[0.9375rem] leading-6 text-muted-foreground">
            Use o e-mail profissional vinculado ao escritório.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5" aria-busy={loading}>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">E-mail profissional</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="email"
                  disabled={loading}
                  aria-describedby={msg ? "login-error" : undefined}
                  className="h-12 w-full rounded-control border border-input bg-card px-3.5 text-[0.9375rem] text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/70 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"
                  placeholder="nome@escritorio.com.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Senha</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    aria-describedby={msg ? "login-error" : undefined}
                    className="h-12 w-full rounded-control border border-input bg-card px-3.5 pr-12 text-[0.9375rem] text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/70 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    disabled={loading}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPassword}
                    className="absolute right-0.5 top-0.5 flex h-11 w-11 items-center justify-center rounded-[0.65rem] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {msg && (
                <div id="login-error" role="alert" aria-live="polite" className="flex items-start gap-2.5 rounded-control bg-danger-subtle p-3 text-sm leading-5 text-danger-foreground">
                  <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                  <span>{msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 ease-product hover:bg-brand-hover hover:shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-65"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} aria-hidden="true" /> Entrando…
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
        </form>

        <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">
          Ambiente restrito aos profissionais autorizados.
        </p>
      </section>
    </main>
  );
}
