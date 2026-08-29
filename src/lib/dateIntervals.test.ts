import { describe, expect, it } from 'vitest';
import {
  addCalendarYears,
  countCoveredCalendarMonths,
  countElapsedCalendarMonths,
  countInclusiveDays,
  countUniqueCoveredMonths,
  mergeOverlappingIntervals,
  validateDateInterval,
} from './dateIntervals';

describe('validateDateInterval', () => {
  it('aceita um intervalo ordenado e inclusivo', () => {
    expect(validateDateInterval('2024-01-01', '2024-01-01')).toEqual({ valid: true });
  });

  it('rejeita datas inexistentes e fim anterior ao início', () => {
    expect(validateDateInterval('2024-02-30', '2024-03-01')).toEqual({
      valid: false,
      reason: 'invalid-date',
    });
    expect(validateDateInterval('2024-03-02', '2024-03-01')).toEqual({
      valid: false,
      reason: 'end-before-start',
    });
  });
});

describe('contagem de intervalos', () => {
  it('distingue meses decorridos de meses-calendário cobertos', () => {
    expect(countElapsedCalendarMonths('2024-01-01', '2024-01-31')).toBe(0);
    expect(countCoveredCalendarMonths('2024-01-01', '2024-01-31')).toBe(1);
    expect(countCoveredCalendarMonths('2024-01-01', '2024-02-01')).toBe(2);
  });

  it('conta dias inclusivos sem depender do fuso horário', () => {
    expect(countInclusiveDays('2024-02-28', '2024-03-01')).toBe(3);
    expect(countInclusiveDays('2024-03-01', '2024-02-28')).toBe(0);
  });
});

describe('união de períodos', () => {
  it('une períodos sobrepostos e preserva períodos separados', () => {
    expect(
      mergeOverlappingIntervals([
        { inicio: '2020-04-01', fim: '2020-12-31' },
        { inicio: '2020-01-01', fim: '2020-06-30' },
        { inicio: '2022-01-01', fim: '2022-02-28' },
      ]),
    ).toEqual([
      { inicio: '2020-01-01', fim: '2020-12-31' },
      { inicio: '2022-01-01', fim: '2022-02-28' },
    ]);
  });

  it('não duplica carência em sobreposições, duplicatas ou no mesmo mês', () => {
    expect(
      countUniqueCoveredMonths([
        { inicio: '2020-01-01', fim: '2020-06-30' },
        { inicio: '2020-04-01', fim: '2020-12-31' },
        { inicio: '2020-04-01', fim: '2020-12-31' },
        { inicio: '2021-01-01', fim: '2021-01-10' },
        { inicio: '2021-01-20', fim: '2021-01-31' },
      ]),
    ).toBe(13);
  });

  it('ignora intervalos inválidos no total', () => {
    expect(
      countUniqueCoveredMonths([
        { inicio: '2020-01-01', fim: '2020-01-31' },
        { inicio: '2020-03-01', fim: '2020-02-01' },
      ]),
    ).toBe(1);
  });
});

describe('addCalendarYears', () => {
  it('preserva 15 anos exatos e ajusta anos bissextos', () => {
    expect(addCalendarYears('2026-08-29', -15)).toBe('2011-08-29');
    expect(addCalendarYears('2024-02-29', -15)).toBe('2009-02-28');
  });
});
