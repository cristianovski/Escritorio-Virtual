import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { Client } from '../../types';
import { maskCPF } from '../../lib/utils';

interface ClientWorkspaceHeaderProps {
  client: Client;
}

const STATUS_STYLES: Record<string, string> = {
  'A Iniciar': 'bg-warning-subtle text-warning-foreground',
  'Em Andamento': 'bg-info-subtle text-info-foreground',
  Finalizado: 'bg-success-subtle text-success-foreground',
  Suspenso: 'bg-danger-subtle text-danger-foreground',
};

export function ClientWorkspaceHeader({ client: cliente }: ClientWorkspaceHeaderProps) {
  const location = useLocation();
  const navigationRef = useRef<HTMLElement>(null);
  const clientPath = `/cliente/${cliente.id}`;
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
    <header className="shrink-0 border-b border-black/[0.055] bg-background/[0.88] backdrop-blur-xl" aria-labelledby="client-workspace-title">
      <div className="mx-auto w-full max-w-content px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/clientes"
            aria-label="Voltar para clientes"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 id="client-workspace-title" className="truncate text-lg font-semibold tracking-[-0.025em] text-foreground sm:text-xl">
              {cliente.nome || 'Cliente sem nome'}
            </h1>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground" aria-label="Situação do caso">
              <span className="tabular-nums">{formattedCpf}</span>
              <span aria-hidden="true">·</span>
              <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLES[status] || 'bg-secondary text-muted-foreground'}`}>
                {status}
              </span>
              <span aria-hidden="true">·</span>
              <span>Fase {phase.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <nav
          ref={navigationRef}
          className="mt-3 overflow-x-auto scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Áreas do cliente"
        >
          <div className="inline-flex min-w-max gap-1 rounded-control bg-secondary p-1">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.to}
                aria-current={tab.active ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-[0.6rem] px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  tab.active
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
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
