/* =====================================================================
   DATA OSIS SMK NEGERI REMBANG
   Ubah isi file ini untuk mengganti nama, teks, foto, dan kegiatan.
   Semua halaman membaca data dari sini.
   ===================================================================== */

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

  // Untuk foto: taruh file di folder public/foto lalu isi foto: '/foto/ketua.jpg'
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

  // ------------------------------------------------------------------
  // KEGIATAN: program kerja OSIS (takjil, LDKS, MPLS, peringatan hari besar, dll.)
  // kat: Peringatan | Kepemimpinan | Lomba & Seni | Sosial | Olahraga
  // mulai : 'TAHUN-BULAN-TANGGALTJAM:MENIT'      sampai (opsional): 'TAHUN-BULAN-TANGGAL'
  // id    : nama unik tanpa spasi. Foto dokumentasi diambil otomatis dari
  //         public/dokumentasi/kegiatan/<id>/
  // ------------------------------------------------------------------
  kegiatan: [
    {
      id: 'takjil',
      judul: 'Berbagi Takjil Ramadan',
      kat: 'Sosial',
      mulai: '2026-03-06T16:00',
      tempat: 'Sekitar sekolah',
      desk: 'Membagikan takjil kepada pengguna jalan dan warga sekitar sekolah menjelang waktu berbuka.',
    },
    {
      id: 'mpls',
      judul: 'Masa Pengenalan Lingkungan Sekolah (MPLS)',
      kat: 'Kepemimpinan',
      mulai: '2026-07-13T07:00',
      sampai: '2026-07-15',
      tempat: 'Lapangan dan aula sekolah',
      desk: 'Mengenalkan siswa baru pada lingkungan sekolah, tata tertib, dan organisasi. OSIS memandu seluruh rangkaian kegiatan.',
    },
    {
      id: 'raker',
      judul: 'Rapat Kerja (Raker) OSIS',
      kat: 'Kepemimpinan',
      mulai: '2026-07-25T08:00',
      tempat: 'Ruang rapat sekolah',
      desk: 'Menyusun program kerja OSIS satu periode bersama seluruh pengurus dan pembina.',
    },
    {
      id: 'lomba-hutri',
      judul: 'Lomba Antarkelas HUT RI ke-81',
      kat: 'Lomba & Seni',
      mulai: '2026-08-14T07:30',
      tempat: 'Lapangan sekolah',
      desk: 'Lomba tradisional antarkelas untuk memeriahkan hari kemerdekaan.',
    },
    {
      id: 'ldks',
      judul: 'Latihan Dasar Kepemimpinan Siswa (LDKS)',
      kat: 'Kepemimpinan',
      mulai: '2026-09-26T07:30',
      sampai: '2026-09-27',
      tempat: 'Sekolah dan area perkemahan',
      desk: 'Pelatihan kepemimpinan, kerja tim, dan manajemen kegiatan bagi pengurus OSIS dan perwakilan kelas.',
    },
    {
      id: 'sumpah-pemuda',
      judul: 'Peringatan Hari Sumpah Pemuda',
      kat: 'Peringatan',
      mulai: '2026-10-28T07:30',
      tempat: 'Lapangan upacara',
      desk: 'Upacara dan pameran karya siswa bertema pemuda.',
    },
    {
      id: 'hari-guru',
      judul: 'Peringatan Hari Guru Nasional',
      kat: 'Peringatan',
      mulai: '2026-11-25T07:30',
      tempat: 'Aula sekolah',
      desk: 'Penampilan dan ucapan terima kasih untuk para guru dan tenaga kependidikan.',
    },
    {
      id: 'class-meeting',
      judul: 'Class Meeting dan Pekan Olahraga',
      kat: 'Olahraga',
      mulai: '2026-12-14T07:30',
      sampai: '2026-12-17',
      tempat: 'Lapangan dan GOR sekolah',
      desk: 'Pertandingan futsal, voli, basket, dan lomba antarkelas setelah ujian semester.',
    },
  ],

  // ------------------------------------------------------------------
  // KOLABORASI: kegiatan yang dilakukan OSIS bersama pihak lain
  // (ekstrakurikuler, komunitas, sekolah lain, dan sebagainya).
  // mitra : daftar nama pihak yang diajak berkolaborasi (bebas, tulis nama saja)
  // id    : foto dokumentasi diambil otomatis dari
  //         public/dokumentasi/kolaborasi/<id>/
  // ------------------------------------------------------------------
  kolaborasi: [
    {
      id: 'pesantren-kilat',
      judul: 'Pesantren Kilat Ramadan bersama Rohis',
      mulai: '2026-03-10T08:00',
      tempat: 'Musala sekolah',
      mitra: ['Rohis'],
      desk: 'Kajian, tadarus, dan kegiatan keagamaan selama Ramadan yang disiapkan bersama Rohis.',
    },
    {
      id: 'mpls-multimedia',
      judul: 'Dokumentasi dan Siaran MPLS bersama Multimedia',
      mulai: '2026-07-13T07:00',
      tempat: 'Lapangan dan aula sekolah',
      mitra: ['Multimedia'],
      desk: 'Tim multimedia mengabadikan MPLS dan mengelola publikasinya di media sosial sekolah.',
    },
    {
      id: 'pentas-merdeka',
      judul: 'Pentas Seni Kemerdekaan bersama Ekskul Seni',
      mulai: '2026-08-16T13:00',
      tempat: 'Halaman sekolah',
      mitra: ['Seni dan Musik'],
      desk: 'Penampilan musik dan tari dari siswa untuk menyambut HUT RI.',
    },
    {
      id: 'upacara-hutri',
      judul: 'Upacara HUT RI ke-81 bersama Paskibra',
      mulai: '2026-08-17T07:00',
      tempat: 'Lapangan upacara',
      mitra: ['Paskibra', 'Pramuka'],
      desk: 'Upacara bendera yang dipimpin Paskibra dan diikuti seluruh warga sekolah.',
    },
    {
      id: 'penghijauan',
      judul: 'Kerja Bakti dan Penghijauan bersama Pramuka',
      mulai: '2026-08-29T07:00',
      tempat: 'Lingkungan sekolah',
      mitra: ['Pramuka'],
      desk: 'Menanam pohon dan membersihkan lingkungan sekolah bersama anggota Pramuka.',
    },
    {
      id: 'donor-darah',
      judul: 'Donor Darah bersama PMR',
      mulai: '2026-09-05T08:00',
      tempat: 'Aula sekolah',
      mitra: ['PMR'],
      desk: 'Kegiatan donor darah untuk warga sekolah yang dikoordinasi bersama PMR.',
    },
  ],
};
