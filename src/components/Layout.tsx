import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { supabase } from "../lib/supabase";

interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
  matches: (pathname: string) => boolean;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Visão geral",
    to: "/",
    icon: LayoutDashboard,
    matches: (pathname) => pathname === "/",
  },
  {
    label: "Clientes",
    to: "/clientes",
    icon: Users,
    matches: (pathname) => (
      pathname === "/clientes" ||
      pathname.startsWith("/documentos/") ||
      pathname.startsWith("/analise/") ||
      pathname.startsWith("/linha-tempo/") ||
      (pathname.startsWith("/cliente/") && !pathname.endsWith("/financeiro"))
    ),
  },
  {
    label: "Financeiro",
    to: "/fluxo-caixa",
    icon: DollarSign,
    matches: (pathname) => (
      pathname === "/fluxo-caixa" || pathname.endsWith("/financeiro")
    ),
  },
  {
    label: "Equipe",
    to: "/advogados",
    icon: BriefcaseBusiness,
    matches: (pathname) => pathname === "/advogados",
  },
];

interface NavigationProps {
  pathname: string;
  onNavigate?: () => void;
}

function Navigation({ pathname, onNavigate }: NavigationProps) {
  return (
    <nav aria-label="Navegação principal" className="space-y-1.5">
      {navigationItems.map((item) => {
        const active = item.matches(pathname);
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon
              aria-hidden="true"
              className={active ? "text-bronze-subtle" : "text-muted-foreground"}
              size={20}
              strokeWidth={2}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface BrandProps {
  compact?: boolean;
  onNavigate?: () => void;
}

function Brand({ compact = false, onNavigate }: BrandProps) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      aria-label="PrevRural — ir para a visão geral"
      className="flex min-h-11 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-xs font-semibold tracking-[0.08em] text-primary-foreground">
        PR
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-bronze" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-bold leading-tight tracking-tight text-slate-950">
          PrevRural
        </span>
        {!compact && (
          <span className="block truncate text-xs font-medium text-slate-500">
            Gestão previdenciária
          </span>
        )}
      </span>
    </Link>
  );
}

interface LogoutButtonProps {
  isSigningOut: boolean;
  onLogout: () => void;
}

function LogoutButton({ isSigningOut, onLogout }: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isSigningOut}
      aria-busy={isSigningOut}
      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
    >
      <LogOut aria-hidden="true" size={20} strokeWidth={2} />
      <span>{isSigningOut ? "Encerrando sessão..." : "Encerrar sessão"}</span>
    </button>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      navigate(0);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-slate-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-950">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[100] rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-navy-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Pular para o conteúdo
      </a>

      <aside className="hidden h-dvh w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <div className="px-1">
          <Brand />
        </div>

        <div className="mt-8 flex-1">
          <p className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Escritório
          </p>
          <Navigation pathname={location.pathname} />
        </div>

        <div className="border-t border-slate-200 pt-3">
          <LogoutButton isSigningOut={isSigningOut} onLogout={handleLogout} />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <Brand compact />

          <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu principal"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Menu aria-hidden="true" size={24} />
              </button>
            </DialogTrigger>

            <DialogContent
              id="mobile-navigation"
              className="left-0 top-0 h-dvh max-h-dvh w-[min(86vw,20rem)] max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-y-0 border-l-0 p-0 [&>button]:right-3 [&>button]:top-3 [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-lg"
            >
              <div className="border-b border-slate-200 px-5 py-5 pr-16">
                <DialogTitle asChild>
                  <div>
                    <Brand onNavigate={() => setIsMobileMenuOpen(false)} />
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Escolha uma área do PrevRural para navegar.
                </DialogDescription>
              </div>

              <div className="flex min-h-[calc(100dvh-81px)] flex-col p-4">
                <p className="mb-2 px-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Escritório
                </p>
                <Navigation
                  pathname={location.pathname}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />

                <div className="mt-auto border-t border-slate-200 pt-3">
                  <LogoutButton isSigningOut={isSigningOut} onLogout={handleLogout} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background focus:outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
