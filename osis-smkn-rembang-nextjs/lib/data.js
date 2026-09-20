// =====================================================================
// DATA WEBSITE OSIS SMK NEGERI REMBANG
// Ubah isi file ini untuk mengganti nama, teks, foto, dan kegiatan.
// Semua halaman membaca data dari sini.
// =====================================================================

export const DATA = {
  periode: '2026/2027',

  visi:
    'Mewujudkan OSIS SMK Negeri Rembang sebagai wadah siswa yang berkarakter, kreatif, dan berjiwa pemimpin, serta siap menghadapi dunia kerja di era digital.',

  misi: [
    'Menumbuhkan disiplin, akhlak yang baik, dan rasa cinta terhadap sekolah.',
    'Menyelenggarakan kegiatan yang melatih kepemimpinan, kreativitas, dan kerja sama siswa.',
    'Menjalin kolaborasi yang aktif dengan seluruh ekstrakurikuler di sekolah.',
    'Memanfaatkan teknologi digital untuk publikasi, dokumentasi, dan layanan aspirasi siswa.',
    'Menjadi jembatan aspirasi antara siswa, guru, dan pihak sekolah.',
    'Menanamkan jiwa wirausaha dan kesiapan kerja sesuai ciri khas SMK.',
  ],

  // Untuk foto: taruh file di folder public/foto lalu isi, misalnya foto: '/foto/ketua.jpg'
  ketua: {
    nama: 'Nama Ketua OSIS',
    jabatan: 'Ketua OSIS',
    foto: null,
    ringkas:
      'Selamat datang di website resmi OSIS SMK Negeri Rembang. Di sini kami mencatat setiap kegiatan agar bisa diikuti dan dinilai bersama.',
    salam: [
      'Assalamu\u2019alaikum warahmatullahi wabarakatuh. Salam sejahtera bagi kita semua.',
      'Selamat datang di website resmi OSIS SMK Negeri Rembang. Di sini kami mencatat setiap kegiatan yang kami jalankan, mulai dari peringatan hari besar, lomba, kegiatan sosial, sampai kolaborasi bersama ekstrakurikuler.',
      'Kami ingin semua teman bisa mengikuti, memberi masukan, dan ikut terlibat. OSIS milik kita bersama, jadi mari terus bergerak dan berkarya.',
      'Wassalamu\u2019alaikum warahmatullahi wabarakatuh.',
    ],
  },

  pembina: {
    nama: 'Nama Pembina OSIS',
    jabatan: 'Pembina OSIS',
    foto: null,
    ringkas:
      'OSIS adalah tempat siswa belajar memimpin dan bertanggung jawab. Kami akan terus mendampingi agar setiap program bermanfaat.',
    salam: [
      'Assalamu\u2019alaikum warahmatullahi wabarakatuh. Salam sejahtera bagi kita semua.',
      'OSIS adalah tempat siswa belajar memimpin, merencanakan, dan bertanggung jawab atas kegiatan yang dijalankan. Kami akan terus mendampingi pengurus agar setiap program bermanfaat bagi seluruh warga sekolah.',
      'Kepada seluruh pengurus dan anggota ekstrakurikuler, teruslah berkolaborasi dan menjaga nama baik SMK Negeri Rembang. Semoga website ini menjadi ruang belajar yang baik bagi kita semua.',
      'Wassalamu\u2019alaikum warahmatullahi wabarakatuh.',
    ],
  },

  // ikon yang tersedia: tenda, plus, bendera, bulan, kamera, nada, bola
  ekskul: [
    { id: 'pramuka', nama: 'Pramuka', ikon: 'tenda', desk: 'Mendampingi pelatihan kepemimpinan dan kegiatan lapangan.' },
    { id: 'pmr', nama: 'PMR', ikon: 'plus', desk: 'Menjaga pos kesehatan dan menggerakkan kegiatan sosial.' },
    { id: 'paskibra', nama: 'Paskibra', ikon: 'bendera', desk: 'Memimpin upacara bendera dan peringatan hari besar.' },
    { id: 'rohis', nama: 'Rohis', ikon: 'bulan', desk: 'Menyiapkan kegiatan keagamaan dan bakti sosial.' },
    { id: 'multimedia', nama: 'Multimedia', ikon: 'kamera', desk: 'Mengelola dokumentasi, siaran, dan lomba kreator digital.' },
    { id: 'seni', nama: 'Seni dan Musik', ikon: 'nada', desk: 'Mengisi panggung dan pertunjukan di setiap acara.' },
    { id: 'olahraga', nama: 'Olahraga', ikon: 'bola', desk: 'Menyelenggarakan pertandingan dan pekan olahraga.' },
  ],

  // kat harus salah satu dari daftar KATEGORI di bawah.
  // mulai: waktu WIB (+07:00). sampai: tanggal akhir (opsional, untuk kegiatan beberapa hari).
  kegiatan: [
    {
      id: 'mpls', judul: 'Masa Pengenalan Lingkungan Sekolah (MPLS)', kat: 'Kepemimpinan',
      mulai: '2026-07-13T07:00:00+07:00', sampai: '2026-07-15', tempat: 'Lapangan dan aula sekolah',
      ekskul: ['pramuka', 'pmr', 'paskibra'],
      desk: 'Mengenalkan siswa baru pada lingkungan sekolah, tata tertib, organisasi, dan ekstrakurikuler. OSIS memandu kegiatan bersama para pembina ekskul.',
    },
    {
      id: 'hutri', judul: 'Upacara dan Lomba HUT RI ke-81', kat: 'Peringatan',
      mulai: '2026-08-17T07:00:00+07:00', tempat: 'Lapangan upacara',
      ekskul: ['paskibra', 'pramuka', 'olahraga'],
      desk: 'Upacara bendera diikuti seluruh warga sekolah, dilanjutkan lomba tradisional antarkelas.',
    },
    {
      id: 'ldk', judul: 'Latihan Dasar Kepemimpinan (LDK)', kat: 'Kepemimpinan',
      mulai: '2026-09-26T07:30:00+07:00', sampai: '2026-09-27', tempat: 'Sekolah dan area perkemahan',
      ekskul: ['pramuka', 'pmr'],
      desk: 'Pelatihan kepemimpinan, kerja tim, dan manajemen kegiatan bagi pengurus OSIS dan perwakilan kelas.',
    },
    {
      id: 'baksos', judul: 'Bakti Sosial dan Donor Darah', kat: 'Sosial',
      mulai: '2026-10-10T08:00:00+07:00', tempat: 'Aula sekolah',
      ekskul: ['pmr', 'rohis'],
      desk: 'Penggalangan bantuan dan donor darah untuk masyarakat sekitar, dikoordinasi bersama PMR.',
    },
    {
      id: 'santri', judul: 'Peringatan Hari Santri', kat: 'Peringatan',
      mulai: '2026-10-22T07:30:00+07:00', tempat: 'Halaman sekolah',
      ekskul: ['rohis', 'seni'],
      desk: 'Apel dan pentas religi yang disiapkan bersama Rohis dan ekstrakurikuler seni.',
    },
    {
      id: 'sumpah', judul: 'Peringatan Hari Sumpah Pemuda', kat: 'Peringatan',
      mulai: '2026-10-28T07:30:00+07:00', tempat: 'Lapangan upacara',
      ekskul: ['multimedia', 'seni', 'paskibra'],
      desk: 'Upacara dan pameran karya siswa bertema pemuda. Tim multimedia mengelola dokumentasi dan siaran langsung.',
    },
    {
      id: 'dcd', judul: 'Digital Creators Day', kat: 'Lomba & Seni',
      mulai: '2026-11-07T08:00:00+07:00', tempat: 'Laboratorium komputer dan aula',
      ekskul: ['multimedia'],
      desk: 'Lomba desain poster, video pendek, dan konten media sosial antarkelas dengan tema sekolah.',
    },
    {
      id: 'guru', judul: 'Peringatan Hari Guru Nasional', kat: 'Peringatan',
      mulai: '2026-11-25T07:30:00+07:00', tempat: 'Aula sekolah',
      ekskul: ['seni', 'multimedia'],
      desk: 'Penampilan dan ucapan terima kasih untuk para guru dan tenaga kependidikan.',
    },
    {
      id: 'classmeeting', judul: 'Class Meeting dan Pekan Olahraga', kat: 'Olahraga',
      mulai: '2026-12-14T07:30:00+07:00', sampai: '2026-12-17', tempat: 'Lapangan dan GOR sekolah',
      ekskul: ['olahraga', 'pmr'],
      desk: 'Pertandingan futsal, voli, basket, dan lomba antarkelas setelah ujian semester. PMR bersiaga di pos kesehatan.',
    },
    {
      id: 'pentas', judul: 'Pentas Seni dan Bazar Wirausaha', kat: 'Lomba & Seni',
      mulai: '2026-12-19T09:00:00+07:00', tempat: 'Halaman dan aula sekolah',
      ekskul: ['seni', 'multimedia', 'pramuka'],
      desk: 'Panggung karya siswa dan bazar produk hasil belajar jurusan, dikelola bersama ekstrakurikuler.',
    },
  ],
};

export const KATEGORI = ['Peringatan', 'Kepemimpinan', 'Lomba & Seni', 'Sosial', 'Olahraga'];
