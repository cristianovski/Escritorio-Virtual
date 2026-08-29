-- Secure the existing single-owner model before introducing organizations.
-- This migration deliberately preserves every document and Storage object.

-- Make ownership explicit on tables that previously relied only on the session.
alter table public.clients
  alter column user_id set default auth.uid();

alter table public.clients
  add constraint clients_user_id_fkey
  foreign key (user_id) references auth.users (id);

alter table public.lawyers
  alter column user_id set default auth.uid();

alter table public.transactions
  add column user_id uuid references auth.users (id) default auth.uid();

alter table public.dashboard_notes
  add column user_id uuid references auth.users (id) default auth.uid();

-- Client-linked transactions inherit their client's owner.
update public.transactions as transaction
set user_id = client.user_id
from public.clients as client
where transaction.client_id = client.id
  and transaction.user_id is null;

-- The current installation has one owner. Refuse an ambiguous backfill if that
-- ever stops being true before this migration is applied.
do $$
declare
  sole_user_id uuid;
  user_count bigint;
begin
  select count(*) into user_count from auth.users;

  select id into sole_user_id
  from auth.users
  order by created_at, id
  limit 1;

  if (
    exists (select 1 from public.transactions where user_id is null)
    or exists (select 1 from public.dashboard_notes where user_id is null)
  ) and user_count <> 1 then
    raise exception 'Cannot assign ownerless records: expected one auth user, found %', user_count;
  end if;

  update public.transactions
  set user_id = sole_user_id
  where user_id is null;

  update public.dashboard_notes
  set user_id = sole_user_id
  where user_id is null;
end
$$;

do $$
begin
  if exists (select 1 from public.clients where user_id is null) then
    raise exception 'Cannot secure clients while ownerless rows exist';
  end if;

  if exists (select 1 from public.lawyers where user_id is null) then
    raise exception 'Cannot secure lawyers while ownerless rows exist';
  end if;

  if exists (select 1 from public.transactions where user_id is null) then
    raise exception 'Cannot secure transactions while ownerless rows exist';
  end if;

  if exists (select 1 from public.dashboard_notes where user_id is null) then
    raise exception 'Cannot secure dashboard notes while ownerless rows exist';
  end if;
end
$$;

alter table public.clients alter column user_id set not null;
alter table public.lawyers alter column user_id set not null;
alter table public.transactions alter column user_id set not null;
alter table public.dashboard_notes alter column user_id set not null;

-- Index every ownership predicate and frequently traversed foreign key.
create index if not exists clients_user_id_idx
  on public.clients (user_id);
create index if not exists lawyers_user_id_idx
  on public.lawyers (user_id);
create index if not exists client_documents_client_id_idx
  on public.client_documents (client_id);
create index if not exists transactions_client_id_idx
  on public.transactions (client_id);
create index if not exists transactions_user_id_idx
  on public.transactions (user_id);
create index if not exists dashboard_notes_user_id_idx
  on public.dashboard_notes (user_id);
create index if not exists financial_responsibilities_client_id_idx
  on public.financial_responsibilities (client_id);
create index if not exists financial_installments_comprovante_id_idx
  on public.financial_installments (comprovante_id);

-- Remove policies that granted every authenticated account access to all rows.
drop policy if exists "Permitir tudo para autenticados" on public.clients;
drop policy if exists "Usuários podem ver seus clientes" on public.clients;
drop policy if exists "Leitura e Escrita GED" on public.client_documents;
drop policy if exists "Acesso Total Jules e Calculadora" on public.interviews;
drop policy if exists "Permitir tudo para usuarios autenticados nas transações" on public.transactions;
drop policy if exists "Usuários podem ver seus advogados" on public.lawyers;

alter table public.clients enable row level security;
alter table public.client_documents enable row level security;
alter table public.interviews enable row level security;
alter table public.transactions enable row level security;
alter table public.lawyers enable row level security;
alter table public.dashboard_notes enable row level security;

create policy "Owners can read clients"
  on public.clients for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Owners can create clients"
  on public.clients for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Owners can update clients"
  on public.clients for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Owners can delete clients"
  on public.clients for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners can read client documents"
  on public.client_documents for select to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = client_documents.client_id
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can create client documents"
  on public.client_documents for insert to authenticated
  with check (
    exists (
      select 1
      from public.clients as client
      where client.id = client_documents.client_id
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can update client documents"
  on public.client_documents for update to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = client_documents.client_id
        and client.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.clients as client
      where client.id = client_documents.client_id
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can delete client documents"
  on public.client_documents for delete to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = client_documents.client_id
        and client.user_id = (select auth.uid())
    )
  );

create policy "Owners can read interviews"
  on public.interviews for select to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = interviews.client_id
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can create interviews"
  on public.interviews for insert to authenticated
  with check (
    exists (
      select 1
      from public.clients as client
      where client.id = interviews.client_id
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can update interviews"
  on public.interviews for update to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = interviews.client_id
        and client.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.clients as client
      where client.id = interviews.client_id
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can delete interviews"
  on public.interviews for delete to authenticated
  using (
    exists (
      select 1
      from public.clients as client
      where client.id = interviews.client_id
        and client.user_id = (select auth.uid())
    )
  );

create policy "Owners can read transactions"
  on public.transactions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Owners can create transactions"
  on public.transactions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      client_id is null
      or exists (
        select 1
        from public.clients as client
        where client.id = transactions.client_id
          and client.user_id = (select auth.uid())
      )
    )
  );
create policy "Owners can update transactions"
  on public.transactions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      client_id is null
      or exists (
        select 1
        from public.clients as client
        where client.id = transactions.client_id
          and client.user_id = (select auth.uid())
      )
    )
  );
create policy "Owners can delete transactions"
  on public.transactions for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners can read lawyers"
  on public.lawyers for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Owners can create lawyers"
  on public.lawyers for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Owners can update lawyers"
  on public.lawyers for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Owners can delete lawyers"
  on public.lawyers for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Owners can read dashboard notes"
  on public.dashboard_notes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Owners can create dashboard notes"
  on public.dashboard_notes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Owners can update dashboard notes"
  on public.dashboard_notes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Owners can delete dashboard notes"
  on public.dashboard_notes for delete to authenticated
  using (user_id = (select auth.uid()));

-- AI support tables remain service-role only; obsolete empty finance tables are
-- closed until a future, organization-aware model replaces them.
alter table public.library_theses enable row level security;
alter table public.document_ocr_cache enable row level security;
alter table public.financial_responsibilities enable row level security;
alter table public.financial_installments enable row level security;
alter table public.financial_expenses enable row level security;

-- Storage access follows the owner of the client ID in the first path segment.
drop policy if exists "Acesso Total Autenticado" on storage.objects;

create policy "Owners can read evidence files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'evidence-files'
    and exists (
      select 1
      from public.clients as client
      where client.id::text = (storage.foldername(name))[1]
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can create evidence files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'evidence-files'
    and exists (
      select 1
      from public.clients as client
      where client.id::text = (storage.foldername(name))[1]
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can update evidence files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'evidence-files'
    and exists (
      select 1
      from public.clients as client
      where client.id::text = (storage.foldername(name))[1]
        and client.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'evidence-files'
    and exists (
      select 1
      from public.clients as client
      where client.id::text = (storage.foldername(name))[1]
        and client.user_id = (select auth.uid())
    )
  );
create policy "Owners can delete evidence files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'evidence-files'
    and exists (
      select 1
      from public.clients as client
      where client.id::text = (storage.foldername(name))[1]
        and client.user_id = (select auth.uid())
    )
  );

update storage.buckets
set public = false,
    file_size_limit = 20971520,
    allowed_mime_types = array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    ]::text[]
where id = 'evidence-files';
