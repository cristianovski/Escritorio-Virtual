import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Users,
  type LucideIcon,
} from "lucide-react";
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
    <nav aria-label="Navegação principal" className="space-y-1">
      {navigationItems.map((item) => {
        const active = item.matches(pathname);
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              active
                ? "bg-card text-foreground shadow-panel ring-1 ring-black/[0.035]"
                : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
            }`}
          >
            <Icon
              aria-hidden="true"
              className={active ? "text-primary" : "text-muted-foreground"}
              size={19}
              strokeWidth={1.8}
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
      className="flex min-h-11 items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-xs font-semibold tracking-[0.06em] text-primary shadow-panel ring-1 ring-black/[0.04]">
        PR
      </span>
      <span className="min-w-0">
        <span className="block text-base font-semibold leading-tight tracking-[-0.02em] text-foreground">
          PrevRural
        </span>
        {!compact && (
          <span className="block truncate text-xs text-muted-foreground">
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
  compact?: boolean;
}

function LogoutButton({ isSigningOut, onLogout, compact = false }: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isSigningOut}
      aria-busy={isSigningOut}
      aria-label={compact ? (isSigningOut ? "Encerrando sessão" : "Encerrar sessão") : undefined}
      className={`flex min-h-11 items-center rounded-control text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${compact ? "w-11 justify-center" : "w-full gap-3 px-3 py-2.5 text-left"}`}
    >
      <LogOut aria-hidden="true" size={19} strokeWidth={1.8} />
      {!compact ? <span>{isSigningOut ? "Encerrando sessão..." : "Encerrar sessão"}</span> : null}
    </button>
  );
}

function MobileNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Navegação móvel"
      className="shrink-0 border-t border-black/[0.055] bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="grid grid-cols-4">
        {navigationItems.map((item) => {
          const active = item.matches(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.6875rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon aria-hidden="true" size={21} strokeWidth={active ? 2.1 : 1.7} />
              <span>{item.label === "Visão geral" ? "Visão" : item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
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
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-background font-sans text-foreground">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[100] rounded-control bg-foreground px-4 py-3 text-sm font-medium text-background shadow-floating focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Pular para o conteúdo
      </a>

      <aside className="hidden h-dvh w-64 shrink-0 flex-col border-r border-black/[0.055] bg-background px-4 py-5 lg:flex">
        <div className="px-1">
          <Brand />
        </div>

        <div className="mt-8 flex-1">
          <Navigation pathname={location.pathname} />
        </div>

        <div className="border-t border-black/[0.055] pt-3">
          <LogoutButton isSigningOut={isSigningOut} onLogout={handleLogout} />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 shrink-0 items-center justify-between border-b border-black/[0.055] bg-background/[0.85] px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
          <Brand compact />
          <LogoutButton compact isSigningOut={isSigningOut} onLogout={handleLogout} />
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background focus:outline-none"
        >
          <Outlet />
        </main>
        <MobileNavigation pathname={location.pathname} />
      </div>
    </div>
  );
}
