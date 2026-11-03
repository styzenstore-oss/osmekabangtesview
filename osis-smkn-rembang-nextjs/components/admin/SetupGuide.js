import Link from 'next/link';

// Ditampilkan jika Supabase belum diatur: admin sudah bisa login, tetapi belum ada tempat menyimpan data.
export default function SetupGuide() {
  return (
    <div className="setup">
      <div className="setup-card box">
        <h1>Satu langkah lagi</h1>
        <p>
          Anda sudah berhasil masuk, tetapi tempat penyimpanan data (Supabase) belum terhubung. Ikuti langkah berikut. Hanya perlu dilakukan sekali.
        </p>
        <ol>
          <li>
            Buat proyek gratis di <b>supabase.com</b>.
          </li>
          <li>
            Buka <b>SQL Editor</b>, tempel isi file <code>supabase-setup.sql</code>, lalu klik <b>Run</b>.
          </li>
          <li>
            Buka <b>Project Settings &gt; API</b>, salin <b>Project URL</b> dan <b>service_role key</b>.
          </li>
          <li>
            Di Vercel (Settings &gt; Environment Variables) atau file <code>.env.local</code>, isi <code>SUPABASE_URL</code> dan <code>SUPABASE_SERVICE_KEY</code>.
          </li>
          <li>Deploy ulang, lalu buka halaman ini lagi.</li>
        </ol>
        <p className="setup-note">Selama belum terhubung, website tetap tampil memakai data bawaan di file lib/data.js.</p>
        <Link className="btn btn-ghost" href="/">
          Lihat website
        </Link>
      </div>
    </div>
  );
}
