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


-- =====================================================================
-- 3) HARI GURU NASIONAL: voting guru terfavorit (anonim, kode unik per siswa)
--    Aman dijalankan ulang. Tidak ada nama/identitas pemilih yang disimpan.
-- =====================================================================
create table if not exists public.guru_votes (
  id bigint generated always as identity primary key,
  kelas_id text not null,
  guru_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists guru_votes_kelas_idx on public.guru_votes (kelas_id);
alter table public.guru_votes enable row level security;

-- Kode voting: satu kode untuk satu siswa, terikat ke satu kelas, sekali pakai.
-- Sengaja TIDAK ada kolom waktu atau id suara di sini, supaya kode tidak bisa dihubungkan ke pilihan guru.
create table if not exists public.guru_kode (
  kode text primary key,
  kelas_id text not null,
  dipakai boolean not null default false
);
create index if not exists guru_kode_kelas_idx on public.guru_kode (kelas_id);
alter table public.guru_kode enable row level security;

-- Fungsi versi lama (kuota per kelas) tidak dipakai lagi.
drop function if exists public.cast_guru_vote(text, text, int);

-- Memeriksa kode tanpa memakainya.
create or replace function public.cek_guru_kode(p_kode text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select jsonb_build_object('ada', true, 'dipakai', dipakai, 'kelas_id', kelas_id) from public.guru_kode where kode = p_kode),
    jsonb_build_object('ada', false)
  );
$$;

-- Memakai kode dan mencatat suara dalam satu transaksi: kode hanya bisa dipakai sekali, walau ditekan bersamaan.
create or replace function public.cast_guru_vote_kode(p_kode text, p_guru text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_kelas text;
begin
  update public.guru_kode set dipakai = true where kode = p_kode and dipakai = false returning kelas_id into v_kelas;
  if v_kelas is null then
    return jsonb_build_object('ok', false, 'alasan',
      case when exists (select 1 from public.guru_kode where kode = p_kode) then 'terpakai' else 'tidak-valid' end);
  end if;
  insert into public.guru_votes (kelas_id, guru_id) values (v_kelas, p_guru);
  return jsonb_build_object('ok', true, 'kelas_id', v_kelas);
end $$;

-- Rekap jumlah suara per kelas dan per guru.
create or replace function public.rekap_guru_vote()
returns table (kelas_id text, guru_id text, jumlah bigint)
language sql
security definer
set search_path = public
as $$
  select kelas_id, guru_id, count(*) from public.guru_votes group by kelas_id, guru_id;
$$;

revoke all on function public.cek_guru_kode(text) from public, anon, authenticated;
revoke all on function public.cast_guru_vote_kode(text, text) from public, anon, authenticated;
revoke all on function public.rekap_guru_vote() from public, anon, authenticated;
grant execute on function public.cek_guru_kode(text) to service_role;
grant execute on function public.cast_guru_vote_kode(text, text) to service_role;
grant execute on function public.rekap_guru_vote() to service_role;
