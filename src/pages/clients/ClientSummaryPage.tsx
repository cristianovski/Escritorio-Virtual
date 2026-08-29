import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  FolderOpen,
  Landmark,
  MapPin,
  Phone,
  Scale,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Client, WithClientProps } from '../../types';
import { maskCPF, maskPhone } from '../../lib/utils';

interface ChecklistItem {
  label: string;
  complete: boolean;
  detail: string;
}

function formatDate(value?: string) {
  if (!value) return 'Não informado';

  const normalized = value.includes('T') ? value : `${value}T12:00:00`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime())
    ? 'Não informado'
    : parsed.toLocaleDateString('pt-BR');
}

function buildChecklist(client: Client): ChecklistItem[] {
  return [
    {
      label: 'Identificação civil',
      complete: Boolean(client.nome && client.cpf && client.data_nascimento),
      detail: 'Nome, CPF e data de nascimento',
    },
    {
      label: 'Contato',
      complete: Boolean(client.telefone),
      detail: 'Telefone principal',
    },
    {
      label: 'Dados previdenciários',
      complete: Boolean(client.nit),
      detail: 'NIT/PIS/PASEP',
    },
    {
      label: 'Endereço',
      complete: Boolean(client.endereco && client.cidade),
      detail: 'Endereço e município',
    },
  ];
}

export function ClientSummaryPage({ cliente }: WithClientProps) {
  const checklist = buildChecklist(cliente);
  const completedItems = checklist.filter((item) => item.complete).length;
  const completion = Math.round((completedItems / checklist.length) * 100);
  const pendingItem = checklist.find((item) => !item.complete);
  const phase = cliente.fase_processo || 'Administrativo';
  const status = cliente.status_processo || 'A Iniciar';

  const quickActions = [
    {
      label: 'Completar cadastro',
      description: 'Revise os dados civis e de contato.',
      to: `/cliente/${cliente.id}/cadastro`,
      icon: UserRound,
    },
    {
      label: 'Entrevista rural',
      description: 'Registre imóvel, produção e histórico.',
      to: `/cliente/${cliente.id}/entrevista`,
      icon: ClipboardList,
    },
    {
      label: 'Organizar documentos',
      description: 'Adicione e classifique as provas.',
      to: `/documentos/${cliente.id}`,
      icon: FolderOpen,
    },
    {
      label: 'Analisar benefício',
      description: 'Monte períodos e estratégia previdenciária.',
      to: `/analise/${cliente.id}`,
      icon: Scale,
    },
  ];

  return (
    <main className="h-full overflow-y-auto bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Visão do atendimento</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Resumo do cliente
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Dados essenciais, pendências e próximos passos reunidos em um só lugar.
            </p>
          </div>
          <Link
            to={`/cliente/${cliente.id}/cadastro`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Editar cadastro <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do cliente">
          {[
            { label: 'Situação', value: status, helper: 'Andamento atual' },
            { label: 'Fase', value: phase, helper: 'Etapa do processo' },
            { label: 'Cadastro essencial', value: `${completion}%`, helper: `${completedItems} de ${checklist.length} itens` },
            { label: 'Última atualização', value: formatDate(cliente.updated_at || cliente.created_at), helper: 'Dados do cliente' },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-xl font-semibold text-card-foreground">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-base font-semibold text-card-foreground">Próxima ação recomendada</h3>
              </div>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    {pendingItem ? <FileSearch size={19} aria-hidden="true" /> : <CheckCircle2 size={19} aria-hidden="true" />}
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {pendingItem ? `Completar ${pendingItem.label.toLowerCase()}` : 'Cadastro essencial completo'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pendingItem
                        ? `${pendingItem.detail}. Depois, avance para a organização das provas.`
                        : 'Revise agora os documentos e a análise previdenciária.'}
                    </p>
                  </div>
                </div>
                <Link
                  to={pendingItem ? `/cliente/${cliente.id}/cadastro` : `/documentos/${cliente.id}`}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {pendingItem ? 'Revisar cadastro' : 'Ver documentos'}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-base font-semibold text-card-foreground">Atalhos do atendimento</h3>
              </div>
              <div className="grid gap-px overflow-hidden rounded-b-xl bg-border sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="group flex min-h-28 items-start gap-3 bg-white p-5 transition-colors hover:bg-secondary focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <action.icon className="mt-0.5 shrink-0 text-primary" size={19} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        {action.label}
                        <ArrowRight className="opacity-0 transition-opacity group-hover:opacity-100" size={14} aria-hidden="true" />
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-muted-foreground">{action.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-base font-semibold text-card-foreground">Completude do cadastro</h3>
              </div>
              <div className="p-5">
                <div
                  className="h-2 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-label="Completude do cadastro essencial"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completion}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
                </div>
                <ul className="mt-5 space-y-4">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className={item.complete ? 'mt-0.5 shrink-0 text-emerald-700' : 'mt-0.5 shrink-0 text-slate-300'}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-base font-semibold text-card-foreground">Dados rápidos</h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <Landmark className="mt-0.5 shrink-0 text-muted-foreground" size={17} aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">CPF</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{cliente.cpf ? maskCPF(cliente.cpf) : 'Não informado'}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 shrink-0 text-muted-foreground" size={17} aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Nascimento</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{formatDate(cliente.data_nascimento)}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 shrink-0 text-muted-foreground" size={17} aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Telefone</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{cliente.telefone ? maskPhone(cliente.telefone) : 'Não informado'}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 shrink-0 text-muted-foreground" size={17} aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Localidade</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{cliente.cidade || 'Não informada'}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <WalletCards className="mt-0.5 shrink-0 text-muted-foreground" size={17} aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-muted-foreground">NIT</dt>
                    <dd className="mt-0.5 font-medium text-foreground">{cliente.nit || 'Não informado'}</dd>
                  </div>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
