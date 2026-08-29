import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  FileSearch,
  Landmark,
  MapPin,
  Phone,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Client, WithClientProps } from '../../types';
import { maskCPF, maskPhone } from '../../lib/utils';
import { PageHeader } from '../../components/ui/PageHeader';

interface ChecklistItem {
  label: string;
  complete: boolean;
  detail: string;
}

function formatDate(value?: string) {
  if (!value) return 'Não informado';

  const normalized = value.includes('T') ? value : value + 'T12:00:00';
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
      detail: 'Nome, CPF e nascimento',
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
  const nextLink = pendingItem
    ? '/cliente/' + cliente.id + '/cadastro'
    : '/documentos/' + cliente.id;

  const essentials = [
    {
      label: 'CPF',
      value: cliente.cpf ? maskCPF(cliente.cpf) : 'Não informado',
      icon: Landmark,
    },
    {
      label: 'Nascimento',
      value: formatDate(cliente.data_nascimento),
      icon: CalendarDays,
    },
    {
      label: 'Telefone',
      value: cliente.telefone ? maskPhone(cliente.telefone) : 'Não informado',
      icon: Phone,
    },
    {
      label: 'Localidade',
      value: cliente.cidade || 'Não informada',
      icon: MapPin,
    },
    {
      label: 'NIT',
      value: cliente.nit || 'Não informado',
      icon: WalletCards,
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-background px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-content space-y-8">
        <PageHeader
          headingLevel={2}
          title="Resumo do atendimento"
          description={'Última atualização em ' + formatDate(cliente.updated_at || cliente.created_at) + '.'}
          actions={(
            <Link
              to={'/cliente/' + cliente.id + '/cadastro'}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-brand-hover hover:shadow-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Editar cadastro <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <section
              aria-labelledby="next-action-title"
              className="rounded-surface bg-brand-subtle p-5 ring-1 ring-brand/10 sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-sm" aria-hidden="true">
                    {pendingItem ? <FileSearch size={20} /> : <CheckCircle2 size={20} />}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-primary">Próximo passo</p>
                    <h2 id="next-action-title" className="mt-1 text-lg font-semibold tracking-[-0.02em] text-foreground">
                      {pendingItem ? 'Completar ' + pendingItem.label.toLowerCase() : 'Organizar os documentos'}
                    </h2>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                      {pendingItem
                        ? pendingItem.detail + '. Depois, avance para a organização das provas.'
                        : 'O cadastro essencial está completo. Revise agora as provas disponíveis.'}
                    </p>
                  </div>
                </div>
                <Link
                  to={nextLink}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-black/[0.045] transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {pendingItem ? 'Revisar cadastro' : 'Ver documentos'}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>

            <section aria-labelledby="essential-data-title" className="overflow-hidden rounded-surface bg-card shadow-surface ring-1 ring-black/[0.035]">
              <div className="px-5 py-5 sm:px-6">
                <h2 id="essential-data-title" className="text-lg font-semibold tracking-[-0.02em] text-foreground">Informações essenciais</h2>
                <p className="mt-1 text-sm text-muted-foreground">Dados usados com maior frequência durante o atendimento.</p>
              </div>
              <dl className="grid border-t border-border/70 sm:grid-cols-2">
                {essentials.map((item, index) => (
                  <div
                    key={item.label}
                    className={'flex gap-3 border-b border-border/70 px-5 py-4 last:border-b-0 sm:px-6 ' + (
                      index === essentials.length - 1
                        ? 'sm:col-span-2'
                        : index % 2 === 0 ? 'sm:border-r' : ''
                    )}
                  >
                    <item.icon className="mt-0.5 shrink-0 text-muted-foreground" size={17} aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{item.label}</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-foreground">{item.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <aside>
            <section aria-labelledby="completion-title" className="rounded-surface bg-card p-5 shadow-surface ring-1 ring-black/[0.035] sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 id="completion-title" className="text-base font-semibold tracking-[-0.015em] text-foreground">Cadastro essencial</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{completedItems} de {checklist.length} itens concluídos</p>
                </div>
                <span className="text-2xl font-semibold tracking-[-0.03em] tabular-nums text-foreground">{completion}%</span>
              </div>

              <div
                className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-label="Completude do cadastro essencial"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completion}
              >
                <div className="h-full rounded-full bg-primary" style={{ width: completion + '%' }} />
              </div>

              <ul className="mt-5 divide-y divide-border/70">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    {item.complete ? (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <Circle size={18} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <span className="text-[0.6875rem] font-medium text-muted-foreground">
                          {item.complete ? 'Completo' : 'Pendente'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
