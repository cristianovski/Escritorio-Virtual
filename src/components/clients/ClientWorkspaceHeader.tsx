import { Link, useLocation } from 'react-router-dom';
import type { Client } from '../../types';
import { maskCPF } from '../../lib/utils';

interface ClientWorkspaceHeaderProps {
  client: Client;
}

const STATUS_STYLES: Record<string, string> = {
  'A Iniciar': 'border-amber-200 bg-amber-50 text-amber-800',
  'Em Andamento': 'border-blue-200 bg-blue-50 text-blue-800',
  Finalizado: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Suspenso: 'border-rose-200 bg-rose-50 text-rose-800',
};

export function ClientWorkspaceHeader({ client: cliente }: ClientWorkspaceHeaderProps) {
  const location = useLocation();
  const clientPath = `/cliente/${cliente.id}`;
  const status = cliente.status_processo || 'A Iniciar';
  const phase = cliente.fase_processo || 'Administrativo';
  const formattedCpf = cliente.cpf ? maskCPF(cliente.cpf) : 'CPF não informado';
  const clientInitial = cliente.nome?.trim().charAt(0).toUpperCase() || '?';

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

  return (
    <header className="shrink-0 border-b border-border bg-white" aria-labelledby="client-workspace-title">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground"
              aria-hidden="true"
            >
              {clientInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Cliente</p>
              <h1 id="client-workspace-title" className="truncate text-lg font-semibold text-foreground sm:text-xl">
                {cliente.nome || 'Cliente sem nome'}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{formattedCpf}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2" aria-label="Situação do caso">
            <span
              className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                STATUS_STYLES[status] || 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              {status}
            </span>
            <span className="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
              Fase: {phase}
            </span>
          </div>
        </div>

        <nav className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" aria-label="Áreas do cliente">
          <div className="flex min-w-max items-end gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.to}
                aria-current={tab.active ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  tab.active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
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
