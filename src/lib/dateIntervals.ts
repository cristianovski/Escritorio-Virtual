const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/;

export interface DateInterval {
  inicio: string;
  fim: string;
}

export type DateIntervalValidation =
  | { valid: true }
  | { valid: false; reason: 'missing-date' | 'invalid-date' | 'end-before-start' };

interface ParsedDateOnly {
  iso: string;
  year: number;
  month: number;
  day: number;
  epochDay: number;
  monthIndex: number;
}

const parseDateOnly = (value: string): ParsedDateOnly | null => {
  if (!value) return null;

  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(0);
  parsed.setUTCHours(0, 0, 0, 0);
  parsed.setUTCFullYear(year, month - 1, day);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    iso: `${match[1]}-${match[2]}-${match[3]}`,
    year,
    month,
    day,
    epochDay: Math.floor(parsed.getTime() / DAY_IN_MS),
    monthIndex: year * 12 + month - 1,
  };
};

export const normalizeDateOnly = (value: string): string | null =>
  parseDateOnly(value)?.iso ?? null;

export const validateDateInterval = (inicio: string, fim: string): DateIntervalValidation => {
  if (!inicio || !fim) return { valid: false, reason: 'missing-date' };

  const start = parseDateOnly(inicio);
  const end = parseDateOnly(fim);
  if (!start || !end) return { valid: false, reason: 'invalid-date' };
  if (start.epochDay > end.epochDay) return { valid: false, reason: 'end-before-start' };

  return { valid: true };
};

export const isValidDateInterval = (inicio: string, fim: string): boolean =>
  validateDateInterval(inicio, fim).valid;

/** Quantidade de mudanças de mês entre as duas datas (mesmo mês = zero). */
export const countElapsedCalendarMonths = (inicio: string, fim: string): number => {
  if (!isValidDateInterval(inicio, fim)) return 0;

  const start = parseDateOnly(inicio)!;
  const end = parseDateOnly(fim)!;
  return end.monthIndex - start.monthIndex;
};

/**
 * Meses-calendário tocados pelo intervalo, com as duas extremidades inclusivas.
 * Ex.: 01/01 a 31/01 = 1 mês; 01/01 a 01/02 = 2 meses.
 */
export const countCoveredCalendarMonths = (inicio: string, fim: string): number => {
  if (!isValidDateInterval(inicio, fim)) return 0;
  return countElapsedCalendarMonths(inicio, fim) + 1;
};

export const countInclusiveDays = (inicio: string, fim: string): number => {
  if (!isValidDateInterval(inicio, fim)) return 0;

  const start = parseDateOnly(inicio)!;
  const end = parseDateOnly(fim)!;
  return end.epochDay - start.epochDay + 1;
};

/** Une intervalos de datas que realmente se sobrepõem. Intervalos inválidos são descartados. */
export const mergeOverlappingIntervals = (intervals: DateInterval[]): DateInterval[] => {
  const sorted = intervals
    .filter(({ inicio, fim }) => isValidDateInterval(inicio, fim))
    .map(({ inicio, fim }) => ({
      inicio: normalizeDateOnly(inicio)!,
      fim: normalizeDateOnly(fim)!,
    }))
    .sort((a, b) => parseDateOnly(a.inicio)!.epochDay - parseDateOnly(b.inicio)!.epochDay);

  return sorted.reduce<DateInterval[]>((merged, current) => {
    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push(current);
      return merged;
    }

    const previousEnd = parseDateOnly(previous.fim)!;
    const currentStart = parseDateOnly(current.inicio)!;
    if (currentStart.epochDay <= previousEnd.epochDay) {
      if (parseDateOnly(current.fim)!.epochDay > previousEnd.epochDay) {
        previous.fim = current.fim;
      }
      return merged;
    }

    merged.push(current);
    return merged;
  }, []);
};

/**
 * Conta os meses-calendário únicos cobertos pelo conjunto de períodos.
 * Sobreposições, duplicatas e dois intervalos no mesmo mês contam uma única vez.
 */
export const countUniqueCoveredMonths = (intervals: DateInterval[]): number => {
  const monthRanges = mergeOverlappingIntervals(intervals)
    .map(({ inicio, fim }) => ({
      start: parseDateOnly(inicio)!.monthIndex,
      end: parseDateOnly(fim)!.monthIndex,
    }))
    .sort((a, b) => a.start - b.start);

  const mergedMonthRanges = monthRanges.reduce<Array<{ start: number; end: number }>>(
    (merged, current) => {
      const previous = merged[merged.length - 1];
      if (!previous || current.start > previous.end + 1) {
        merged.push({ ...current });
      } else {
        previous.end = Math.max(previous.end, current.end);
      }
      return merged;
    },
    [],
  );

  return mergedMonthRanges.reduce((total, range) => total + range.end - range.start + 1, 0);
};

/** Soma anos preservando o dia sempre que possível e ajustando 29/02 para 28/02. */
export const addCalendarYears = (value: string, years: number): string => {
  const date = parseDateOnly(value);
  if (!date || !Number.isInteger(years)) return '';

  const targetYear = date.year + years;
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, date.month, 0)).getUTCDate();
  const targetDay = Math.min(date.day, lastDayOfTargetMonth);

  return `${String(targetYear).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
};

export const compareDateOnly = (left: string, right: string): number => {
  const leftDate = parseDateOnly(left);
  const rightDate = parseDateOnly(right);
  if (!leftDate && !rightDate) return 0;
  if (!leftDate) return 1;
  if (!rightDate) return -1;
  return leftDate.epochDay - rightDate.epochDay;
};
