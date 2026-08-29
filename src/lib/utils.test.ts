import { afterEach, describe, expect, it, vi } from 'vitest';

import { cn, getLocalDateISO, maskCEP, maskCPF, maskPhone } from './utils';

describe('formatadores de dados pessoais', () => {
  it('formata CPF e descarta caracteres não numéricos', () => {
    expect(maskCPF('123abc45678909')).toBe('123.456.789-09');
  });

  it('formata telefone celular brasileiro', () => {
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('formata CEP e descarta dígitos excedentes', () => {
    expect(maskCEP('45000abc12399')).toBe('45000-123');
  });
});

describe('utilitários de interface e data', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolve classes Tailwind conflitantes pela última declaração', () => {
    expect(cn('px-2 text-sm', undefined, 'px-4')).toBe('text-sm px-4');
  });

  it('retorna a data local no formato ISO sem deslocamento de dia', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 29, 23, 59, 59));

    expect(getLocalDateISO()).toBe('2026-08-29');
  });
});
