import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retorna a data atual no formato YYYY-MM-DD respeitando o fuso horário local.
 */
export function getLocalDateISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}

// Máscaras
export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

export const maskPhone = (value: string): string => {
  let v = value.replace(/\D/g, '');
  v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
  v = v.replace(/(\d)(\d{4})$/, '$1-$2');
  return v.substring(0, 15);
};

export const maskCEP = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

export const diffMonths = (d1: string, d2: string) => {
  if (!d1 || !d2) return 0;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const months = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth()) + 1;
  return months > 0 ? months : 0;
};

export const diffDays = (d1: string, d2: string) => {
  if (!d1 || !d2) return 0;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};