import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  ShieldCheck,
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
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8 sm:px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-dialog border border-border bg-card shadow-surface lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative flex flex-col justify-between bg-primary px-6 py-7 text-primary-foreground sm:px-8 sm:py-9 lg:min-h-[580px] lg:px-10 lg:py-10">
          <div>
            <div className="flex items-center gap-3" aria-label="PrevRural">
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/10 text-xs font-semibold tracking-[0.1em]">
                PR
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-bronze" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-semibold leading-tight tracking-tight">PrevRural</span>
                <span className="block text-xs text-primary-foreground/70">Gestão previdenciária</span>
              </span>
            </div>

            <div className="mt-12 hidden max-w-sm sm:block lg:mt-24">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-bronze-subtle">Campo &amp; Lei</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] lg:text-4xl">
                A rotina previdenciária em um só lugar.
              </h2>
              <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
                Clientes, documentos e análises organizados para apoiar o trabalho diário do escritório.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 border-t border-white/15 pt-5 lg:mt-12">
            <ShieldCheck className="mt-0.5 shrink-0 text-bronze-subtle" size={19} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">Ambiente de acesso restrito</p>
              <p className="mt-1 text-xs leading-5 text-primary-foreground/65">
                Use somente as credenciais fornecidas pelo administrador do escritório.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-subtle text-brand">
                <LockKeyhole size={19} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Acesse sua conta</h1>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                Entre com o e-mail profissional vinculado ao escritório.
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
                  className="h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"
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
                    className="h-11 w-full rounded-lg border border-input bg-card px-3.5 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"
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
                    className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {msg && (
                <div id="login-error" role="alert" aria-live="polite" className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger-subtle p-3 text-sm leading-5 text-danger-foreground">
                  <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                  <span>{msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-65"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} aria-hidden="true" /> Entrando…
                  </>
                ) : (
                  <>
                    Entrar no sistema <LogIn size={17} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">
              O acesso é disponibilizado pelo administrador do escritório.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
