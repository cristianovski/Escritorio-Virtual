import { useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ExternalLink,
  FileText,
  Folder,
  Search,
} from 'lucide-react';
import type { Client } from '../../types';
import { useTimeline, type UnifiedTimelineItem } from '../../hooks/useTimeline';
import { useToast } from '../../hooks/use-toast';
import {
  createDocumentPreviewUrl,
  getDocumentObjectKeyForClient,
} from '../../lib/documentStorage';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Surface } from '../../components/ui/Surface';

interface TimelinePageProps {
  cliente: Client;
  onBack: () => void;
}

function TimelineSkeleton() {
  return (
    <Surface padding="none" role="status" aria-live="polite">
      <span className="sr-only">Consolidando histórico do cliente…</span>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="grid animate-pulse gap-4 border-b border-border/70 p-4 motion-reduce:animate-none last:border-0 sm:grid-cols-[5rem_minmax(0,1fr)] sm:p-5 md:grid-cols-[5rem_minmax(0,1fr)_10rem]"
        >
          <div className="h-7 w-16 rounded-full bg-secondary" />
          <div className="space-y-2">
            <div className="h-4 w-48 max-w-full rounded bg-secondary" />
            <div className="h-3 w-72 max-w-full rounded bg-secondary" />
          </div>
          <div className="h-11 rounded-control bg-secondary sm:col-start-2 md:col-start-auto" />
        </div>
      ))}
    </Surface>
  );
}

export function TimelinePage({ cliente }: TimelinePageProps) {
  const { loading, timeline } = useTimeline(cliente);
  const { toast } = useToast();
  const [filter, setFilter] = useState('');

  const handleOpenDocument = async (item: UnifiedTimelineItem) => {
    if (!item.fileUrl) return;

    const previewWindow = window.open('about:blank', '_blank');
    if (previewWindow) previewWindow.opener = null;

    try {
      const signedUrl = await createDocumentPreviewUrl(item.fileUrl);
      if (previewWindow) {
        previewWindow.location.replace(signedUrl);
      } else {
        toast({
          title: 'Pop-up bloqueado',
          description: 'Permita pop-ups para abrir o documento em uma nova aba.',
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      previewWindow?.close();
      const message = error instanceof Error
        ? error.message
        : 'Não foi possível autorizar o acesso ao documento.';
      toast({ title: 'Documento indisponível', description: message, variant: 'destructive' });
    }
  };

  const normalizedFilter = filter.trim().toLocaleLowerCase('pt-BR');
  const filteredItems = timeline.filter((item) => {
    if (!normalizedFilter) return true;

    const type = (item.type || '').toLocaleLowerCase('pt-BR');
    const name = (item.customName || '').toLocaleLowerCase('pt-BR');
    const year = String(item.displayYear);
    return type.includes(normalizedFilter) || name.includes(normalizedFilter) || year.includes(normalizedFilter);
  });
  const emptyBecauseOfSearch = timeline.length > 0 && filteredItems.length === 0;

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-content space-y-8 p-4 sm:p-6 lg:p-8">
        <PageHeader
          headingLevel={2}
          title="Linha do tempo"
          description={`Histórico cronológico de ${cliente.nome || 'cliente'}, reunido em uma única visualização.`}
        />

        <section aria-labelledby="timeline-heading" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-md">
              <label htmlFor="timeline-search" className="sr-only">
                Buscar no histórico por documento, ano ou tipo
              </label>
              <div className="relative">
                <Search
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="timeline-search"
                  type="search"
                  placeholder="Buscar por documento, ano ou tipo"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="h-11 w-full rounded-control border border-input bg-surface-subtle/55 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70"
                  autoComplete="off"
                />
              </div>
            </div>

            {!loading ? (
              <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
                {filteredItems.length === timeline.length
                  ? `${timeline.length} ${timeline.length === 1 ? 'registro' : 'registros'}`
                  : `${filteredItems.length} de ${timeline.length} registros`}
              </p>
            ) : null}
          </div>

          <h2 id="timeline-heading" className="sr-only">
            Histórico cronológico
          </h2>

          {loading ? (
            <TimelineSkeleton />
          ) : filteredItems.length === 0 ? (
            <Surface padding="none">
              <EmptyState
                icon={emptyBecauseOfSearch ? <Search aria-hidden="true" /> : <CalendarDays aria-hidden="true" />}
                title={emptyBecauseOfSearch ? 'Nenhum registro encontrado' : 'Histórico ainda vazio'}
                description={
                  emptyBecauseOfSearch
                    ? 'Revise o documento, ano ou tipo informado para ampliar a busca.'
                    : 'Os documentos e registros do cliente aparecerão aqui em ordem cronológica.'
                }
                action={
                  emptyBecauseOfSearch ? (
                    <Button variant="outline" onClick={() => setFilter('')}>
                      Limpar busca
                    </Button>
                  ) : undefined
                }
              />
            </Surface>
          ) : (
            <Surface padding="none" className="overflow-hidden">
              <ol className="divide-y divide-border/70">
                {filteredItems.map((item) => {
                  const title = item.customName || item.type;
                  const fileExtension = item.fileName?.includes('.')
                    ? item.fileName.split('.').pop()?.toUpperCase()
                    : 'DOC';
                  const isGed = item.source.includes('GED');
                  const isPrivateGed = Boolean(
                    item.fileUrl &&
                    item.source === 'GED (Novo)' &&
                    getDocumentObjectKeyForClient(item.fileUrl, cliente.id),
                  );

                  return (
                    <li
                      key={item.id}
                      className="grid gap-4 p-4 sm:grid-cols-[5rem_minmax(0,1fr)] sm:p-5 md:grid-cols-[5rem_minmax(0,1fr)_auto] md:items-center"
                    >
                      <div className="flex sm:block">
                        <time className="inline-flex min-h-7 items-center rounded-full bg-secondary px-2.5 text-xs font-medium tabular-nums text-foreground">
                          {item.displayYear}
                        </time>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold leading-5 text-foreground">
                              {title}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              {isGed ? <Folder size={13} aria-hidden="true" /> : <FileText size={13} aria-hidden="true" />}
                              <span>{item.source}</span>
                            </p>
                          </div>
                          <span className="rounded-md bg-secondary px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
                            {fileExtension}
                          </span>
                        </div>

                        {item.law ? (
                          <div className="mt-3 rounded-control bg-secondary/60 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                            <span className="font-medium text-foreground">Base legal: </span>
                            {item.law}
                          </div>
                        ) : null}
                      </div>

                      <div className="sm:col-start-2 md:col-start-auto">
                        {item.fileUrl && isPrivateGed ? (
                          <button
                            type="button"
                            onClick={() => void handleOpenDocument(item)}
                            aria-label={`Abrir documento ${title}`}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto"
                          >
                            <ExternalLink size={16} aria-hidden="true" />
                            Abrir documento
                          </button>
                        ) : item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Abrir documento ${title}`}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-auto"
                          >
                            <ExternalLink size={16} aria-hidden="true" />
                            Abrir documento
                          </a>
                        ) : (
                          <span className="flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-secondary px-4 text-sm text-muted-foreground md:w-auto">
                            <AlertCircle size={16} aria-hidden="true" />
                            Sem arquivo
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Surface>
          )}
        </section>
      </div>
    </div>
  );
}
