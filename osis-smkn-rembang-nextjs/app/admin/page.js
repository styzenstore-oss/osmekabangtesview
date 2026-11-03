import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminApp from '@/components/admin/AdminApp';
import SetupGuide from '@/components/admin/SetupGuide';
import { COOKIE, verifySession } from '@/lib/auth';
import { readRaw } from '@/lib/content';
import { dbReady, mediaBase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Middleware sudah memeriksa; ini lapisan kedua.
  if (!(await verifySession(cookies().get(COOKIE)?.value))) redirect('/admin/login');
  if (!dbReady()) return <SetupGuide />;

  const raw = await readRaw();
  return (
    <AdminApp
      initial={{ settings: raw.settings, kegiatan: raw.kegiatan, kolaborasi: raw.kolaborasi }}
      dbError={raw.error}
      mediaBase={mediaBase()}
    />
  );
}
