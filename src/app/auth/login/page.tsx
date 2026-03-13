import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-bold">Sign In</h1>
        <LoginForm />
      </div>
    </main>
  );
}
