import { authConfigured } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm siap={authConfigured()} />;
}
