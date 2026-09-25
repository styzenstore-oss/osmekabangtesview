-- =====================================================================
-- SKEMA LENGKAP DATABASE OSIS SMK NEGERI REMBANG
-- Dashboard Supabase -> Project Anda -> SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. ENUM ROLE & STATUS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('superadmin', 'osis', 'ekskul');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_kegiatan AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABEL PROFIL AKUN (Sinkron Otomatis dengan Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nama TEXT,
  role TEXT NOT NULL DEFAULT 'osis' CHECK (role IN ('superadmin', 'osis', 'ekskul')),
  ekskul_name TEXT, -- Contoh: 'PMR', 'Pramuka', 'Paskibra', 'Rohis', 'Multimedia', 'Seni & Musik'
  jabatan TEXT,     -- Contoh: 'Pembina OSIS', 'Ketua OSIS', 'Koordinator Dokumentasi PMR'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger Otomatis: Saat ada user baru dibuat di Auth, otomatis masuk ke profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama, role, ekskul_name, jabatan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'osis'),
    NEW.raw_user_meta_data->>'ekskul_name',
    NEW.raw_user_meta_data->>'jabatan'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS PROFIL
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profil dapat dibaca oleh publik"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Profil dapat diedit oleh user bersangkutan atau superadmin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "Superadmin dapat mengelola profil pengguna"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- 3. TABEL KEGIATAN & KOLABORASI
CREATE TABLE IF NOT EXISTS public.kegiatan (
  id TEXT PRIMARY KEY,
  judul TEXT NOT NULL,
  kat TEXT NOT NULL, -- Peringatan, Kepemimpinan, Lomba & Seni, Sosial, Olahraga
  jenis TEXT NOT NULL DEFAULT 'kegiatan' CHECK (jenis IN ('kegiatan', 'kolaborasi')),
  mulai TEXT NOT NULL, -- Contoh: '2026-08-14T07:30'
  sampai TEXT,         -- Contoh: '2026-08-15'
  tempat TEXT NOT NULL,
  desk TEXT NOT NULL,
  mitra JSONB DEFAULT '[]'::jsonb, -- Array string: ["PMR", "Paskibra"]
  fotos JSONB DEFAULT '[]'::jsonb, -- Array foto: [{"src": "url", "alt": "keterangan"}]
  poster_url TEXT,
  status_verifikasi TEXT DEFAULT 'approved' CHECK (status_verifikasi IN ('pending', 'approved', 'rejected')),
  catatan_revisi TEXT,             -- Catatan dari pembina jika ada revisi
  created_by UUID REFERENCES auth.users(id),
  created_by_email TEXT,
  created_by_role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS KEGIATAN
ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;

-- Pengunjung publik hanya melihat kegiatan yang sudah diapprove
CREATE POLICY "Kegiatan yang sudah disetujui dapat dibaca siapa saja"
  ON public.kegiatan FOR SELECT
  USING (status_verifikasi = 'approved' OR auth.role() = 'authenticated');

-- Tambah kegiatan: bisa dilakukan oleh semua user admin yang login
CREATE POLICY "Admin yang login dapat menambah kegiatan"
  ON public.kegiatan FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Edit kegiatan: Superadmin bebas edit apa saja; OSIS/Ekskul edit buatannya sendiri
CREATE POLICY "Admin dapat mengubah kegiatannya sendiri atau superadmin"
  ON public.kegiatan FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Hapus kegiatan: Hanya pemilik atau superadmin
CREATE POLICY "Admin dapat menghapus kegiatannya sendiri atau superadmin"
  ON public.kegiatan FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- 4. STORAGE BUCKET (DOKUMENTASI FOTO)
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumentasi', 'dokumentasi', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Kebijakan Storage Foto
CREATE POLICY "Foto dokumentasi dapat dilihat publik"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dokumentasi');

CREATE POLICY "Admin login dapat mengunggah foto"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dokumentasi');

CREATE POLICY "Admin login dapat menghapus foto"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'dokumentasi');
