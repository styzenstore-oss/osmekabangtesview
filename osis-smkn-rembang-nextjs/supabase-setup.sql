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
-- 3) HARI GURU NASIONAL: voting guru terfavorit (anonim, satu kode per kelas, kuota = jumlah siswa)
--    Aman dijalankan ulang. Tidak ada nama/identitas pemilih yang disimpan.
-- =====================================================================
create table if not exists public.guru_votes (
  id bigint generated always as identity primary key,
  kelas_id text not null,
  guru_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists guru_votes_kelas_idx on public.guru_votes (kelas_id);
-- Kategori suara: 'guru' atau 'tendik'. Satu siswa = satu suara guru + satu suara tendik.
alter table public.guru_votes add column if not exists kategori text not null default 'guru';
alter table public.guru_votes enable row level security;

-- Sisa dari versi kode-per-siswa (jika pernah dijalankan) dibersihkan.
drop function if exists public.cek_guru_kode(text);
drop function if exists public.cast_guru_vote_kode(text, text);
drop table if exists public.guru_kode;

-- Fungsi versi lama dibersihkan (tanda tangannya berubah).
drop function if exists public.cast_guru_vote(text, text, int);
drop function if exists public.rekap_guru_vote();

-- Mencatat satu suara siswa secara atomik: satu suara guru, ditambah satu suara tendik bila ada.
-- Kuota kelas dihitung dari jumlah suara guru (= jumlah siswa yang sudah memilih), tidak mungkin terlampaui walau ditekan bersamaan.
create or replace function public.cast_guru_vote(p_kelas text, p_guru text, p_tendik text, p_kuota int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtext('guru_vote:' || p_kelas));
  select count(*) into n from public.guru_votes where kelas_id = p_kelas and kategori = 'guru';
  if n >= p_kuota then
    return jsonb_build_object('ok', false, 'alasan', 'penuh', 'jumlah', n);
  end if;
  insert into public.guru_votes (kelas_id, guru_id, kategori) values (p_kelas, p_guru, 'guru');
  if p_tendik is not null and p_tendik <> '' then
    insert into public.guru_votes (kelas_id, guru_id, kategori) values (p_kelas, p_tendik, 'tendik');
  end if;
  return jsonb_build_object('ok', true, 'jumlah', n + 1);
end $$;

-- Rekap jumlah suara per kelas, kategori, dan calon.
create or replace function public.rekap_guru_vote()
returns table (kelas_id text, kategori text, guru_id text, jumlah bigint)
language sql
security definer
set search_path = public
as $$
  select kelas_id, kategori, guru_id, count(*) from public.guru_votes group by kelas_id, kategori, guru_id;
$$;

revoke all on function public.cast_guru_vote(text, text, text, int) from public, anon, authenticated;
revoke all on function public.rekap_guru_vote() from public, anon, authenticated;
grant execute on function public.cast_guru_vote(text, text, text, int) to service_role;
grant execute on function public.rekap_guru_vote() to service_role;
