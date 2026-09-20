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
    nama: '-----__------',
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
    nama: 'Moch. Fajrin',
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
      ekskul: ['o', 'pmr', 'paskibra'],
      desk: 'Mengenalkan siswa baru pada lingkungan sekolah, tata tertib, organisasi, dan ekstrakurikuler. OSIS memandu kegiatan bersama para pembina ekskul.',
    },
    {
      id: 'hutri', judul: 'Upacara dan Lomba HUT RI ke-81', kat: 'Peringatan',
      mulai: '2026-08-19T07:00:00+07:00', tempat: 'Lapangan upacara',
      ekskul: ['olahraga'],
      desk: 'Upacara bendera diikuti seluruh warga sekolah, dilanjutkan lomba tradisional antarkelas.',
    },
    {
      id: 'gerak siaga', judul: 'sajian kegiatan Palang Merah Remaja kepada murid baru', kat: 'Sosial',
      mulai: '2026-07-13T08:00:00+07:00', tempat: 'Aula sekolah',
      ekskul: ['pmr', 'osis'],
      desk: 'memperkenalkan ekstra kulikuler kepada seluruh siswa/siswi baru smknrembang ',
    },
  ],
};

export const KATEGORI = ['Peringatan', 'Kepemimpinan', 'Lomba & Seni', 'Sosial', 'Olahraga'];
