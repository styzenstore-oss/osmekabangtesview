// Foto yang diunggah lewat panel admin disimpan di Supabase Storage,
// jadi alamat Supabase perlu didaftarkan agar Next.js boleh menampilkannya.
let hostSupabase = null;
try {
  if (process.env.SUPABASE_URL) hostSupabase = new URL(process.env.SUPABASE_URL).hostname;
} catch (e) {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: hostSupabase
      ? [{ protocol: 'https', hostname: hostSupabase, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
};

module.exports = nextConfig;
