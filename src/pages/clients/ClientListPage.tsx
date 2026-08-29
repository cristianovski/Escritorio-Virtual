import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  LayoutList,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { maskCPF } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';
import type { Client } from '../../types';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

const STATUS_FILTERS = ['Todos', 'A Iniciar', 'Em Andamento', 'Finalizado', 'Suspenso'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const getStatusTone = (
  status?: Client['status_processo'],
): 'neutral' | 'info' | 'warning' | 'success' | 'danger' => {
  switch (status) {
    case 'Em Andamento':
      return 'info';
    case 'Finalizado':
      return 'success';
    case 'Suspenso':
      return 'danger';
    case 'A Iniciar':
      return 'warning';
    default:
      return 'neutral';
  }
};

const formatCreatedAt = (value?: string) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('pt-BR').format(date);
};

function ClientStatus({ client }: { client: Client }) {
  const status = client.status_processo || 'A Iniciar';

  return (
    <StatusBadge tone={getStatusTone(status)} size="sm" dot>
      {status}
    </StatusBadge>
  );
}

function ClientListSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="Carregando clientes">
      <span className="sr-only">Carregando clientes…</span>

      <div className="hidden overflow-hidden rounded-surface bg-card shadow-surface ring-1 ring-black/[0.035] xl:block">
        <div className="h-11 animate-pulse border-b border-border bg-surface-subtle" />
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="grid grid-cols-[2fr_1.2fr_1.2fr_0.8fr_0.7fr] gap-4 border-b border-border px-5 py-4 last:border-0">
            <div className="h-9 animate-pulse rounded-md bg-surface-subtle" />
            <div className="h-9 animate-pulse rounded-md bg-surface-subtle" />
            <div className="h-9 animate-pulse rounded-md bg-surface-subtle" />
            <div className="h-7 animate-pulse rounded-md bg-surface-subtle" />
            <div className="h-7 animate-pulse rounded-md bg-surface-subtle" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-surface bg-card shadow-surface ring-1 ring-black/[0.035] xl:hidden">
        {[1, 2, 3].map((item) => (
          <div key={item} className="border-b border-border/70 p-4 last:border-0">
            <div className="h-12 animate-pulse rounded-md bg-surface-subtle" />
            <div className="mt-4 h-8 animate-pulse rounded-md bg-surface-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const requestedStatus = searchParams.get('status');
  const statusFilter: StatusFilter = STATUS_FILTERS.includes(requestedStatus as StatusFilter)
    ? requestedStatus as StatusFilter
    : 'Todos';

  const updateStatusFilter = (nextStatus: StatusFilter) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextStatus === 'Todos') nextParams.delete('status');
    else nextParams.set('status', nextStatus);
    setSearchParams(nextParams, { replace: true });
  };

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (error: unknown) {
      const technicalMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Falha ao carregar clientes:', technicalMessage);
      setLoadError(true);
      toast({
        title: 'Não foi possível carregar os clientes',
        description: 'Verifique sua conexão e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');
  const searchDigits = searchTerm.replace(/\D/g, '');
  const filteredClients = clients.filter((client) => {
    if (statusFilter !== 'Todos' && (client.status_processo || 'A Iniciar') !== statusFilter) {
      return false;
    }
    if (!normalizedSearch) return true;

    const clientCpf = client.cpf?.replace(/\D/g, '') || '';
    return (
      client.nome?.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      (searchDigits.length > 0 && clientCpf.includes(searchDigits))
    );
  });

  const emptyBecauseOfSearch = clients.length > 0 && filteredClients.length === 0;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-content space-y-8 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Clientes"
          description="Consulte cadastros e acesse o acompanhamento previdenciário de cada cliente."
          actions={(
            <Button onClick={() => navigate('/cliente/novo')}>
              <Plus aria-hidden="true" size={17} />
              Novo cliente
            </Button>
          )}
        />

        <section aria-labelledby="client-list-heading" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid w-full gap-3 sm:max-w-2xl sm:grid-cols-[minmax(0,1fr)_12rem]">
              <div>
              <label htmlFor="client-search" className="sr-only">
                Buscar cliente por nome ou CPF
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="client-search"
                  type="search"
                  autoComplete="off"
                  placeholder="Buscar por nome ou CPF"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-11 w-full rounded-control border border-input bg-card pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/70"
                />
              </div>
              </div>
              <div>
                <label htmlFor="client-status-filter" className="sr-only">
                  Filtrar clientes por situação
                </label>
                <select
                  id="client-status-filter"
                  value={statusFilter}
                  onChange={(event) => updateStatusFilter(event.target.value as StatusFilter)}
                  className="h-11 w-full rounded-control border border-input bg-card px-3 text-sm text-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/70"
                >
                  {STATUS_FILTERS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {!loading && !loadError ? (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {filteredClients.length === clients.length
                  ? `${clients.length} ${clients.length === 1 ? 'cliente' : 'clientes'}`
                  : `${filteredClients.length} de ${clients.length} clientes`}
              </p>
            ) : null}
          </div>

          <h2 id="client-list-heading" className="sr-only">
            Lista de clientes
          </h2>

          {loading ? (
            <ClientListSkeleton />
          ) : loadError ? (
            <EmptyState
              icon={<RefreshCw aria-hidden="true" />}
              title="Clientes indisponíveis"
              description="Não foi possível consultar os cadastros agora. Nenhum dado foi alterado."
              action={(
                <Button variant="outline" onClick={() => void fetchClients()}>
                  <RefreshCw aria-hidden="true" size={16} />
                  Tentar novamente
                </Button>
              )}
            />
          ) : filteredClients.length === 0 ? (
            <EmptyState
              icon={emptyBecauseOfSearch ? <Search aria-hidden="true" /> : <LayoutList aria-hidden="true" />}
              title={emptyBecauseOfSearch || statusFilter !== 'Todos' ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              description={
                emptyBecauseOfSearch || statusFilter !== 'Todos'
                  ? 'Revise a busca ou a situação selecionada para ampliar os resultados.'
                  : 'Cadastre o primeiro cliente para iniciar um atendimento previdenciário.'
              }
              action={
                emptyBecauseOfSearch || statusFilter !== 'Todos' ? (
                  <Button variant="outline" onClick={() => { setSearchTerm(''); updateStatusFilter('Todos'); }}>
                    Limpar filtros
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/cliente/novo')}>
                    <Plus aria-hidden="true" size={16} />
                    Novo cliente
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-surface bg-card shadow-surface ring-1 ring-black/[0.035] xl:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] border-collapse text-left">
                    <caption className="sr-only">
                      Clientes cadastrados, contato, localidade, situação e data de cadastro
                    </caption>
                    <thead className="border-b border-border/70 bg-secondary/55">
                      <tr className="text-xs font-medium text-muted-foreground">
                        <th scope="col" className="px-5 py-3">Cliente</th>
                        <th scope="col" className="px-5 py-3">Contato</th>
                        <th scope="col" className="px-5 py-3">Localidade</th>
                        <th scope="col" className="px-5 py-3">Situação</th>
                        <th scope="col" className="px-5 py-3">Cadastro</th>
                        <th scope="col" className="w-12 px-3 py-3">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="transition-colors hover:bg-secondary/35">
                          <td className="px-5 py-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground" aria-hidden="true">
                                {client.nome?.trim().charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={`/cliente/${client.id}`}
                                  className="block truncate text-sm font-medium text-foreground hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  {client.nome || 'Cliente sem nome'}
                                </Link>
                                <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                                  {client.cpf ? maskCPF(client.cpf) : 'CPF não informado'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">
                            {client.telefone || 'Não informado'}
                          </td>
                          <td className="max-w-[220px] px-5 py-3.5 text-sm text-muted-foreground">
                            <span className="block truncate">
                              {client.cidade || client.endereco || 'Não informada'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <ClientStatus client={client} />
                          </td>
                          <td className="px-5 py-3.5 text-sm tabular-nums text-muted-foreground">
                            {formatCreatedAt(client.created_at)}
                          </td>
                          <td className="px-3 py-3.5 text-right">
                            <Link
                              to={`/cliente/${client.id}`}
                              aria-label={`Abrir resumo de ${client.nome || 'cliente'}`}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <ChevronRight aria-hidden="true" size={17} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="divide-y divide-border/70 overflow-hidden rounded-surface bg-card shadow-surface ring-1 ring-black/[0.035] xl:hidden">
                {filteredClients.map((client) => (
                  <Link
                    key={client.id}
                    to={`/cliente/${client.id}`}
                    className="block p-4 transition-colors hover:bg-secondary/35 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground" aria-hidden="true">
                        {client.nome?.trim().charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-medium text-foreground">
                              {client.nome || 'Cliente sem nome'}
                            </h3>
                            <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                              {client.cpf ? maskCPF(client.cpf) : 'CPF não informado'}
                            </p>
                          </div>
                          <ClientStatus client={client} />
                        </div>

                        <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <Phone aria-hidden="true" size={13} className="shrink-0" />
                            <span className="truncate">{client.telefone || 'Telefone não informado'}</span>
                          </span>
                          <span className="flex min-w-0 items-center gap-1.5">
                            <MapPin aria-hidden="true" size={13} className="shrink-0" />
                            <span className="truncate">
                              {client.cidade || client.endereco || 'Localidade não informada'}
                            </span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight aria-hidden="true" size={17} className="mt-2 shrink-0 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
