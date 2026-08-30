import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, PencilLine } from 'lucide-react';
import type { Client } from '../../types';
import { maskCPF } from '../../lib/utils';

interface ClientWorkspaceHeaderProps {
  client: Client;
}

const STATUS_STYLES: Record<string, string> = {
  'A Iniciar': 'bg-secondary text-muted-foreground',
  'Em Andamento': 'bg-brand-subtle text-brand',
  Finalizado: 'bg-success-subtle text-success-foreground',
  Suspenso: 'bg-warning-subtle text-warning-foreground',
};

export function ClientWorkspaceHeader({ client: cliente }: ClientWorkspaceHeaderProps) {
  const location = useLocation();
  const navigationRef = useRef<HTMLElement>(null);
  const clientPath = `/cliente/${cliente.id}`;
  const displayName = cliente.nome?.trim() || 'Cliente sem nome';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
  const status = cliente.status_processo || 'A Iniciar';
  const phase = cliente.fase_processo || 'Administrativo';
  const formattedCpf = cliente.cpf ? maskCPF(cliente.cpf) : 'CPF não informado';

  const tabs = [
    {
      label: 'Resumo',
      to: clientPath,
      active: location.pathname === clientPath,
    },
    {
      label: 'Cadastro',
      to: `${clientPath}/cadastro`,
      active: location.pathname === `${clientPath}/cadastro`,
    },
    {
      label: 'Entrevista rural',
      to: `${clientPath}/entrevista`,
      active: location.pathname === `${clientPath}/entrevista`,
    },
    {
      label: 'Documentos',
      to: `/documentos/${cliente.id}`,
      active: location.pathname === `/documentos/${cliente.id}`,
    },
    {
      label: 'Análise previdenciária',
      to: `/analise/${cliente.id}`,
      active: location.pathname === `/analise/${cliente.id}`,
    },
    {
      label: 'Honorários',
      to: `${clientPath}/financeiro`,
      active: location.pathname === `${clientPath}/financeiro`,
    },
    {
      label: 'Atividade',
      to: `/linha-tempo/${cliente.id}`,
      active: location.pathname === `/linha-tempo/${cliente.id}`,
    },
  ];

  useEffect(() => {
    const activeLink = navigationRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (typeof activeLink?.scrollIntoView === 'function') {
      activeLink.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }, [location.pathname]);

  return (
    <header
      className="sticky top-0 z-30 shrink-0 border-b border-border/90 bg-card/95 backdrop-blur-xl"
      aria-labelledby="client-workspace-title"
    >
      <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 py-3">
          <Link
            to="/clientes"
            aria-label="Voltar para clientes"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 ease-product hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </Link>

          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-subtle text-sm font-semibold tracking-[-0.02em] text-brand ring-1 ring-brand/10"
            aria-hidden="true"
          >
            {initials}
          </span>

          <div className="min-w-0 flex-1">
            <h1 id="client-workspace-title" className="truncate text-lg font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-xl">
              {displayName}
            </h1>
            <div
              className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
              aria-label="Situação do caso"
            >
              <span className="tabular-nums">{formattedCpf}</span>
              <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLES[status] || 'bg-secondary text-muted-foreground'}`}>
                {status}
              </span>
              <span aria-hidden="true">·</span>
              <span>{phase}</span>
            </div>
          </div>

          {location.pathname !== `${clientPath}/cadastro` ? (
            <Link
              to={`${clientPath}/cadastro`}
              className="hidden min-h-10 shrink-0 items-center justify-center gap-2 rounded-control bg-secondary px-3.5 text-sm font-medium text-foreground transition-colors duration-150 ease-product hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none md:inline-flex"
            >
              <PencilLine size={15} aria-hidden="true" />
              Editar cadastro
            </Link>
          ) : null}
        </div>

        <nav
          ref={navigationRef}
          className="overflow-x-auto scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Áreas do cliente"
        >
          <div className="inline-flex min-w-max gap-5">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.to}
                aria-current={tab.active ? 'page' : undefined}
                className={`relative inline-flex min-h-11 items-center border-b-2 px-0.5 py-2 text-sm font-medium transition-colors duration-150 ease-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none ${
                  tab.active
                    ? 'border-brand text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
