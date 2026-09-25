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

CREATE POLICY "Kegiatan yang disetujui dapat dibaca publik"
  ON public.kegiatan FOR SELECT
  USING (status_verifikasi = 'approved' OR auth.role() = 'authenticated');

CREATE POLICY "Admin yang login dapat menambah kegiatan"
  ON public.kegiatan FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin dapat mengubah kegiatannya sendiri atau superadmin"
  ON public.kegiatan FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

CREATE POLICY "Admin dapat menghapus kegiatannya sendiri atau superadmin"
  ON public.kegiatan FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- 4. TABEL PROFIL ORGANISASI (Ketua, Wakil, Pembina, Visi & Misi)
CREATE TABLE IF NOT EXISTS public.profil_osis (
  id TEXT PRIMARY KEY DEFAULT 'profil_utama',
  periode TEXT NOT NULL DEFAULT '2026/2027',
  visi TEXT NOT NULL,
  misi JSONB NOT NULL DEFAULT '[]'::jsonb,
  ketua_nama TEXT NOT NULL DEFAULT 'Nama Ketua OSIS',
  ketua_jabatan TEXT NOT NULL DEFAULT 'Ketua OSIS',
  ketua_foto TEXT,
  ketua_ringkas TEXT,
  ketua_salam JSONB DEFAULT '[]'::jsonb,
  wakil_nama TEXT NOT NULL DEFAULT 'Nama Wakil Ketua OSIS',
  wakil_jabatan TEXT NOT NULL DEFAULT 'Wakil Ketua OSIS',
  wakil_foto TEXT,
  wakil_ringkas TEXT,
  wakil_salam JSONB DEFAULT '[]'::jsonb,
  pembina_nama TEXT NOT NULL DEFAULT 'Nama Pembina OSIS',
  pembina_jabatan TEXT NOT NULL DEFAULT 'Pembina OSIS',
  pembina_foto TEXT,
  pembina_ringkas TEXT,
  pembina_salam JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Isi Data Default Profil OSIS (bila belum ada)
INSERT INTO public.profil_osis (
  id,
  periode,
  visi,
  misi,
  ketua_nama,
  ketua_jabatan,
  ketua_ringkas,
  ketua_salam,
  wakil_nama,
  wakil_jabatan,
  wakil_ringkas,
  wakil_salam,
  pembina_nama,
  pembina_jabatan,
  pembina_ringkas,
  pembina_salam
)
VALUES (
  'profil_utama',
  '2026/2027',
  'Mewujudkan OSIS SMK Negeri Rembang sebagai wadah siswa yang berkarakter, kreatif, dan berjiwa pemimpin, serta siap menghadapi dunia kerja di era digital.',
  '[
    "Menumbuhkan disiplin, akhlak yang baik, dan rasa cinta terhadap sekolah.",
    "Menyelenggarakan kegiatan yang melatih kepemimpinan, kreativitas, dan kerja sama siswa.",
    "Menjalin kolaborasi yang aktif dengan seluruh ekstrakurikuler di sekolah.",
    "Memanfaatkan teknologi digital untuk publikasi, dokumentasi, dan layanan aspirasi siswa.",
    "Menjadi jembatan aspirasi antara siswa, guru, dan pihak sekolah.",
    "Menanamkan jiwa wirausaha dan kesiapan kerja sesuai ciri khas SMK."
  ]'::jsonb,
  'Nama Ketua OSIS',
  'Ketua OSIS',
  'Selamat datang di website resmi OSIS SMK Negeri Rembang. Di sini kami mencatat setiap kegiatan agar bisa diikuti dan dinilai bersama.',
  '[
    "Assalamu\u2019alaikum warahmatullahi wabarakatuh. Salam sejahtera bagi kita semua.",
    "Selamat datang di website resmi OSIS SMK Negeri Rembang. Di sini kami mencatat setiap kegiatan yang kami jalankan, mulai dari peringatan hari besar, lomba, kegiatan sosial, sampai kolaborasi bersama ekstrakurikuler.",
    "Kami ingin semua teman bisa mengikuti, memberi masukan, dan ikut terlibat. OSIS milik kita bersama, jadi mari terus bergerak dan berkarya.",
    "Wassalamu\u2019alaikum warahmatullahi wabarakatuh."
  ]'::jsonb,
  'Nama Wakil Ketua OSIS',
  'Wakil Ketua OSIS',
  'Bersama mewujudkan sinergi dan kolaborasi antarsiswa di SMK Negeri Rembang.',
  '[
    "Salam hangat dari kami pengurus OSIS. Kami berkomitmen mendampingi seluruh kegiatan siswa dan ekstrakurikuler agar berjalan optimal.",
    "Mari bergerak bersama, wujudkan SMK Negeri Rembang yang berprestasi dan berkarakter!"
  ]'::jsonb,
  'Nama Pembina OSIS',
  'Pembina OSIS',
  'OSIS adalah tempat siswa belajar memimpin dan bertanggung jawab. Kami akan terus mendampingi agar setiap program bermanfaat.',
  '[
    "Assalamu\u2019alaikum warahmatullahi wabarakatuh. Salam sejahtera bagi kita semua.",
    "OSIS adalah tempat siswa belajar memimpin, merencanakan, dan bertanggung jawab atas kegiatan yang dijalankan. Kami akan terus mendampingi pengurus agar setiap program bermanfaat bagi seluruh warga sekolah.",
    "Kepada seluruh pengurus dan anggota ekstrakurikuler, teruslah berkolaborasi dan menjaga nama baik SMK Negeri Rembang. Semoga website ini menjadi ruang belajar yang baik bagi kita semua.",
    "Wassalamu\u2019alaikum warahmatullahi wabarakatuh."
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- RLS PROFIL ORGANISASI
ALTER TABLE public.profil_osis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profil organisasi dapat dibaca publik"
  ON public.profil_osis FOR SELECT
  USING (true);

CREATE POLICY "Profil organisasi dapat diubah oleh Superadmin dan Pengurus OSIS"
  ON public.profil_osis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'osis'))
  );

CREATE POLICY "Profil organisasi dapat dibuat oleh Superadmin dan Pengurus OSIS"
  ON public.profil_osis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'osis'))
  );

-- 5. STORAGE BUCKET (DOKUMENTASI FOTO)
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumentasi', 'dokumentasi', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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
