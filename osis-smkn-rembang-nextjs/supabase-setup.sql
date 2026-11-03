-- Jalankan sekali di Supabase: SQL Editor > New query > tempel seluruh isi file ini > Run.

-- 1) Tabel isi website (kegiatan, kolaborasi, profil, poster)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Tabel dikunci. Hanya server website (memakai service key) yang bisa membaca dan menulis.
alter table public.site_content enable row level security;

-- 2) Tempat foto (bucket publik supaya foto bisa tampil di website)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('osis-media', 'osis-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
