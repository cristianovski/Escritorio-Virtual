import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react';
import { AlertTriangle, ChevronDown, FileText, Ruler } from 'lucide-react';
import type { Periodo } from '../hooks/useBenefitAnalysis';
import { Surface } from './ui/Surface';
import {
  addCalendarYears,
  compareDateOnly,
  countElapsedCalendarMonths,
  countUniqueCoveredMonths,
  isValidDateInterval,
  normalizeDateOnly,
} from '../lib/dateIntervals';

type TimelinePeriodo = Periodo & { num?: number | null };

interface StrategicTimelineProps {
  der: string;
  periodos: TimelinePeriodo[];
  clienteNome?: string;
}

interface RulerState {
  clientKey: string;
  start: string;
  end: string;
}

interface TimelinePresentation {
  label: string;
  barClassName: string;
  legendClassName: string;
  shortLabel: string;
}

const TIMELINE_PRESENTATION: Record<Periodo['tipo'], TimelinePresentation> = {
  rural: {
    label: 'Atividade rural',
    shortLabel: 'R',
    barClassName: 'h-3 rounded-full bg-foreground',
    legendClassName: 'h-3 w-5 rounded-full bg-foreground',
  },
  urbano: {
    label: 'Urbano / CNIS',
    shortLabel: 'U',
    barClassName: 'h-5 rounded-sm border-y-2 border-muted-foreground bg-muted-foreground/70',
    legendClassName: 'h-5 w-5 rounded-sm border-y-2 border-muted-foreground bg-muted-foreground/70',
  },
  beneficio: {
    label: 'Benefício INSS',
    shortLabel: 'B',
    barClassName: 'h-3 rounded-none border border-foreground/55 bg-card',
    legendClassName: 'h-3 w-5 rounded-none border border-foreground/55 bg-card',
  },
  lacuna: {
    label: 'Sem atividade',
    shortLabel: 'S',
    barClassName: 'h-2 rounded-full border border-dashed border-muted-foreground bg-muted',
    legendClassName: 'h-2 w-5 rounded-full border border-dashed border-muted-foreground bg-muted',
  },
  'prova de retorno': {
    label: 'Prova de retorno',
    shortLabel: 'P',
    barClassName: 'h-8 rounded-sm bg-brand',
    legendClassName: 'h-7 w-1.5 rounded-sm bg-brand',
  },
};

const fieldClassName =
  'h-11 w-full rounded-control border border-input bg-surface-subtle/55 px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70 motion-reduce:transition-none';

const UNKNOWN_TIMELINE_PRESENTATION: TimelinePresentation = {
  label: 'Registro legado',
  shortLabel: '?',
  barClassName: 'h-2 rounded-full border border-dashed border-muted-foreground bg-muted',
  legendClassName: 'h-2 w-5 rounded-full border border-dashed border-muted-foreground bg-muted',
};

const getTimelinePresentation = (type: unknown) => (
  TIMELINE_PRESENTATION[type as Periodo['tipo']] ?? UNKNOWN_TIMELINE_PRESENTATION
);

const toUtcTimestamp = (value: string): number | null => {
  const normalized = normalizeDateOnly(value);
  return normalized ? Date.parse(`${normalized}T00:00:00Z`) : null;
};

const formatDate = (value?: string) => {
  if (!value) return 'data não informada';
  return value.split('T')[0].split('-').reverse().join('/');
};

const loadRulerState = (clientKey: string, der: string): RulerState => {
  const savedStart = localStorage.getItem(`ruler_start_${clientKey}`);
  const savedEnd = localStorage.getItem(`ruler_end_${clientKey}`);

  return {
    clientKey,
    start: savedStart && savedEnd ? savedStart : addCalendarYears(der, -15),
    end: savedStart && savedEnd ? savedEnd : der,
  };
};

export default function StrategicTimeline({ der, periodos, clienteNome = 'Cliente' }: StrategicTimelineProps) {
  const startId = useId();
  const endId = useId();
  const titleId = useId();
  const descriptionId = useId();

  const [ruler, setRuler] = useState<RulerState>(() => loadRulerState(clienteNome, der));
  const activeRuler = ruler.clientKey === clienteNome ? ruler : loadRulerState(clienteNome, der);
  const rulerStart = activeRuler.start;
  const rulerEnd = activeRuler.end;

  useEffect(() => {
    if (rulerStart && rulerEnd) {
      localStorage.setItem(`ruler_start_${clienteNome}`, rulerStart);
      localStorage.setItem(`ruler_end_${clienteNome}`, rulerEnd);
    }
  }, [rulerStart, rulerEnd, clienteNome]);

  const rulerIsValid = isValidDateInterval(rulerStart, rulerEnd);
  const currentMonths = countElapsedCalendarMonths(rulerStart, rulerEnd);
  const isDiff180 = rulerIsValid && currentMonths === 180;

  const getLeftPercent = (dateStr: string) => {
    if (!dateStr || !rulerIsValid) return 0;
    const startMs = toUtcTimestamp(rulerStart);
    const endMs = toUtcTimestamp(rulerEnd);
    const currentMs = toUtcTimestamp(dateStr);
    if (startMs === null || endMs === null || currentMs === null || startMs === endMs) return 0;
    const percent = ((currentMs - startMs) / (endMs - startMs)) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const getWidthPercent = (startStr: string, endStr: string) => {
    if (!isValidDateInterval(startStr, endStr || startStr) || !rulerIsValid) return 0;
    const endSafe = endStr || startStr;
    const left = getLeftPercent(startStr);
    const right = getLeftPercent(endSafe);
    return Math.max(0, right - left);
  };

  const provasNumeradas = useMemo(() => {
    return periodos
      .filter((periodo) => periodo.num)
      .sort((a, b) => compareDateOnly(a.dataExpedicao || a.inicio, b.dataExpedicao || b.inicio));
  }, [periodos]);

  const totalRuralMonths = useMemo(() => {
    const ruralIntervals = periodos
      .filter((periodo) => periodo.tipo === 'rural')
      .map(({ inicio, fim }) => ({ inicio, fim }));
    return countUniqueCoveredMonths(ruralIntervals);
  }, [periodos]);

  const ruralYears = Math.floor(totalRuralMonths / 12);
  const ruralRemainingMonths = totalRuralMonths % 12;
  const totalRuralText = `${ruralYears} anos e ${ruralRemainingMonths} meses`;
  const printStyle: CSSProperties = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

  const ninetyMonthMarks = useMemo(() => {
    if (currentMonths <= 0) return [];
    const rulerStartTimestamp = toUtcTimestamp(rulerStart);
    if (rulerStartTimestamp === null) return [];
    const numMarks = Math.floor(currentMonths / 90);
    const marks: Array<{ label: string; percent: number }> = [];

    for (let index = 1; index <= numMarks; index += 1) {
      const positionPercent = ((90 * index) / currentMonths) * 100;
      if (positionPercent < 98) {
        const date = new Date(rulerStartTimestamp);
        date.setUTCMonth(date.getUTCMonth() + 90 * index);
        marks.push({ label: String(date.getUTCFullYear()), percent: positionPercent });
      }
    }

    return marks;
  }, [currentMonths, rulerStart]);

  const timelineText = useMemo(() => {
    const range = `Régua de ${formatDate(rulerStart)} a ${formatDate(rulerEnd)}, com ${currentMonths} meses.`;
    const ruralTotal = `Tempo rural sem sobreposição: ${totalRuralText}, total de ${totalRuralMonths} meses.`;
    if (!periodos.length) return `${range} ${ruralTotal} Nenhum período registrado.`;

    const items = periodos
      .map((periodo) => {
        const presentation = getTimelinePresentation(periodo.tipo);
        const start = formatDate(periodo.dataExpedicao || periodo.inicio);
        const end = formatDate(periodo.fim || periodo.inicio);
        return periodo.tipo === 'prova de retorno'
          ? `${presentation.label} em ${start}.`
          : `${presentation.label}, de ${start} a ${end}.`;
      })
      .join(' ');

    return `${range} ${ruralTotal} ${items}`;
  }, [currentMonths, periodos, rulerEnd, rulerStart, totalRuralMonths, totalRuralText]);

  return (
    <Surface
      style={printStyle}
      padding="none"
      className="overflow-hidden print:m-0 print:break-inside-avoid print:overflow-visible print:rounded-none print:shadow-none print:ring-0"
    >
      <section aria-labelledby={titleId} aria-describedby={descriptionId}>
        <p id={descriptionId} className="sr-only">{timelineText}</p>

        <div className="hidden border-b border-foreground pb-4 print:block">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Linha do tempo rural</h1>
          <div className="mt-2 flex justify-between text-sm text-foreground">
            <span>Segurado(a): {clienteNome}</span>
            <span>DER: {formatDate(der)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-b border-border p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between print:hidden">
          <div>
            <div className="flex items-center gap-2 text-foreground">
              <Ruler aria-hidden="true" size={19} />
              <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em]">Régua de provas</h2>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
              Leitura progressiva das provas em frações de 90 meses, conforme a Súmula 14 da TNU.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
            <div className="sm:w-44">
              <label htmlFor={startId} className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Início da régua
              </label>
              <input
                id={startId}
                type="date"
                value={rulerStart}
                onChange={(event) => setRuler({ ...activeRuler, start: event.target.value })}
                className={`${fieldClassName} text-tabular`}
              />
            </div>
            <div className="sm:w-44">
              <label htmlFor={endId} className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Fim da régua
              </label>
              <input
                id={endId}
                type="date"
                value={rulerEnd}
                onChange={(event) => setRuler({ ...activeRuler, end: event.target.value })}
                className={`${fieldClassName} text-tabular`}
              />
            </div>
          </div>
        </div>

        {!isDiff180 && rulerStart && rulerEnd ? (
          <div
            role="status"
            className="flex items-start gap-2.5 border-b border-warning/20 bg-warning-subtle px-5 py-3 text-sm text-warning-foreground sm:px-6 print:hidden"
          >
            <AlertTriangle aria-hidden="true" size={17} className="mt-0.5 shrink-0" />
            <span>
              <strong className="font-semibold">Atenção.</strong>{' '}
              {rulerIsValid
                ? `O intervalo selecionado tem ${currentMonths} meses; a carência rural padrão exige 180 meses.`
                : 'O fim da régua deve ser igual ou posterior ao início.'}
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-1 border-b border-border px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 print:border-b-2 print:border-foreground print:px-0">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tempo rural sem sobreposição</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-foreground text-tabular">
              {totalRuralText}
            </p>
          </div>
          <p className="text-sm text-muted-foreground text-tabular">{totalRuralMonths} meses computados</p>
        </div>

        <div
          className="overflow-x-auto p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-8 print:overflow-visible print:px-6 print:py-8"
          tabIndex={0}
          role="region"
          aria-label="Visualização gráfica da linha do tempo. Deslize horizontalmente quando necessário."
        >
          <div aria-hidden="true" className="relative min-w-[700px] pb-12 pt-10 print:w-full print:min-w-0">
            <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
            <div className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-muted-foreground" />
            <div className="absolute right-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-muted-foreground" />

            {ninetyMonthMarks.map((mark) => (
              <div key={`${mark.label}-${mark.percent}`}>
                <div
                  className="absolute top-1/2 z-10 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-brand"
                  style={{ left: `${mark.percent}%` }}
                />
                <div
                  className="absolute -bottom-6 z-10 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-brand"
                  style={{ left: `${mark.percent}%` }}
                >
                  {mark.label}
                  <span className="ml-1 text-xs text-muted-foreground">90 meses</span>
                </div>
              </div>
            ))}

            <div className="absolute -bottom-2 left-0 text-xs font-medium text-muted-foreground text-tabular">
              Início · {rulerStart?.split('-')[0]}
            </div>
            <div className="absolute -bottom-2 right-0 text-xs font-medium text-muted-foreground text-tabular">
              Fim · {rulerEnd?.split('-')[0]}
            </div>

            {periodos.map((periodo) => {
              const left = getLeftPercent(periodo.inicio);
              const width = getWidthPercent(periodo.inicio, periodo.fim);
              const docDate = periodo.dataExpedicao || periodo.inicio;
              const leftDoc = getLeftPercent(docDate);
              const isProvaRetorno = periodo.tipo === 'prova de retorno';
              const leftPos = isProvaRetorno ? leftDoc : left;
              const presentation = getTimelinePresentation(periodo.tipo);

              return (
                <div key={periodo.id}>
                  {periodo.num && leftDoc >= 0 && leftDoc <= 100 ? (
                    <div
                      className="absolute top-1/2 z-30 flex -translate-x-1/2 -translate-y-[130%] flex-col items-center"
                      style={{ left: `${leftDoc}%` }}
                    >
                      <div className="z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-foreground text-xs font-semibold text-background print:border-foreground">
                        {periodo.num}
                      </div>
                      <div className="h-4 w-0.5 bg-foreground/55" />
                    </div>
                  ) : null}

                  {leftPos <= 100 && leftPos + width >= 0 ? (
                    <div
                      className={`absolute top-1/2 z-10 -translate-y-1/2 border border-border/80 opacity-90 transition-opacity hover:opacity-100 motion-reduce:transition-none ${presentation.barClassName}`}
                      style={{
                        left: `${leftPos}%`,
                        width: isProvaRetorno ? '6px' : `${Math.max(width, 0.5)}%`,
                        transform: isProvaRetorno
                          ? 'translateY(-50%) translateX(-50%)'
                          : 'translateY(-50%)',
                      }}
                      title={`${presentation.label}: ${periodo.obs || 'sem observação'}\n(${periodo.inicio} a ${periodo.fim || periodo.inicio})`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-border px-5 py-4 text-xs text-muted-foreground sm:px-6 print:border-foreground print:px-0">
          {(Object.entries(TIMELINE_PRESENTATION) as Array<[Periodo['tipo'], TimelinePresentation]>).map(
            ([type, presentation]) => (
              <div key={type} className="flex items-center gap-2">
                <span aria-hidden="true" className={`shrink-0 ${presentation.legendClassName}`} />
                <span>{presentation.label}</span>
              </div>
            ),
          )}
        </div>

        <details className="border-t border-border print:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:px-6">
            Ver períodos em formato textual
            <ChevronDown aria-hidden="true" size={17} className="text-muted-foreground" />
          </summary>
          <div className="border-t border-border px-5 py-4 sm:px-6">
            {periodos.length > 0 ? (
              <ol className="space-y-3">
                {periodos.map((periodo) => {
                  const presentation = getTimelinePresentation(periodo.tipo);
                  return (
                    <li key={periodo.id} className="text-sm leading-6 text-foreground">
                      <span className="font-semibold">{presentation.label}:</span>{' '}
                      {periodo.tipo === 'prova de retorno'
                        ? formatDate(periodo.dataExpedicao || periodo.inicio)
                        : `${formatDate(periodo.inicio)} a ${formatDate(periodo.fim || periodo.inicio)}`}
                      {periodo.obs ? <span className="text-muted-foreground"> — {periodo.obs}</span> : null}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum período registrado.</p>
            )}
          </div>
        </details>

        {provasNumeradas.length > 0 ? (
          <div className="border-t border-border p-5 sm:p-6 print:mt-4 print:border-t-2 print:border-foreground print:px-0">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText aria-hidden="true" size={17} className="text-brand print:text-foreground" />
              Fundamentação das provas utilizadas
            </h3>
            <ol className="space-y-5">
              {provasNumeradas.map((prova) => {
                const isProvaRetorno = prova.tipo === 'prova de retorno';
                const docTitle = isProvaRetorno ? 'Prova de retorno' : prova.linkedDocTitle || 'Prova documental';
                const docLaw = isProvaRetorno && !prova.law
                  ? 'art. 116, § 2º, V, da IN 128/2022'
                  : prova.law;

                return (
                  <li
                    key={prova.id}
                    className="flex items-start gap-3 print:mb-6 print:break-inside-avoid"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-sm font-semibold text-brand print:border print:border-foreground print:bg-transparent print:text-foreground">
                      {prova.num}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {docTitle}{' '}
                        <span className="font-normal text-muted-foreground text-tabular">
                          · {formatDate(prova.dataExpedicao || prova.inicio)}
                        </span>
                      </p>
                      {prova.obs ? <p className="mt-1 text-sm text-muted-foreground">Referência: {prova.obs}</p> : null}
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        <span className="font-medium text-foreground">Fundamento legal:</span> {docLaw}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </section>
    </Surface>
  );
}
