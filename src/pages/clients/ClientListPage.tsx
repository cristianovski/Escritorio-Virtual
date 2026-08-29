import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  LayoutList,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { maskCPF } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';
import type { Client } from '../../types';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

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

      <div className="hidden overflow-hidden rounded-surface border border-border bg-card lg:block">
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

      <div className="grid gap-3 lg:hidden">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-surface border border-border bg-card p-4">
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
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      <main className="mx-auto w-full max-w-content space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          eyebrow="Atendimento"
          title="Clientes"
          description="Consulte cadastros e acesse o acompanhamento previdenciário de cada cliente."
          leading={<Users aria-hidden="true" size={22} />}
          actions={(
            <Button onClick={() => navigate('/cliente/novo')}>
              <Plus aria-hidden="true" size={17} />
              Novo cliente
            </Button>
          )}
        />

        <section aria-labelledby="client-list-heading" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-md">
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
                  className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
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
              title={emptyBecauseOfSearch ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              description={
                emptyBecauseOfSearch
                  ? 'Revise o nome ou CPF informado para ampliar a busca.'
                  : 'Cadastre o primeiro cliente para iniciar um atendimento previdenciário.'
              }
              action={
                emptyBecauseOfSearch ? (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Limpar busca
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
              <div className="hidden overflow-hidden rounded-surface border border-border bg-card shadow-surface lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] border-collapse text-left">
                    <caption className="sr-only">
                      Clientes cadastrados, contato, localidade, situação e data de cadastro
                    </caption>
                    <thead className="border-b border-border bg-surface-subtle/70">
                      <tr className="text-xs font-semibold text-muted-foreground">
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
                    <tbody className="divide-y divide-border">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="transition-colors hover:bg-brand-subtle/30">
                          <td className="px-5 py-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/15 bg-brand-subtle text-sm font-semibold text-brand" aria-hidden="true">
                                {client.nome?.trim().charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={`/cliente/${client.id}`}
                                  className="block truncate text-sm font-semibold text-foreground hover:text-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-brand-subtle hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

              <div className="grid gap-3 lg:hidden">
                {filteredClients.map((client) => (
                  <Link
                    key={client.id}
                    to={`/cliente/${client.id}`}
                    aria-label={`Abrir resumo de ${client.nome || 'cliente'}`}
                    className="rounded-surface border border-border bg-card p-4 shadow-surface transition-colors hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/15 bg-brand-subtle text-sm font-semibold text-brand" aria-hidden="true">
                        {client.nome?.trim().charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-foreground">
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
      </main>
    </div>
  );
}
