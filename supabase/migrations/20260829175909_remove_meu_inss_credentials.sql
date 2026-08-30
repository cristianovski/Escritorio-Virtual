-- Gov.br / Meu INSS credentials must never be collected or retained.
-- This is intentionally irreversible: the application no longer reads or
-- writes this field, and existing plaintext values are purged before removal.

update public.clients
set senha_meu_inss = null
where senha_meu_inss is not null
  and btrim(senha_meu_inss) <> '';

alter table public.clients
  drop column senha_meu_inss;
