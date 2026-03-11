'use server';

import { signIn } from '@/auth';
import { LoginSchema } from '@/lib/validations/auth';
import type { LoginActionState } from '@/lib/validations/auth';
import { AuthError } from 'next-auth';

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = LoginSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { error: firstError?.message ?? 'Validation failed. Please check your input.' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/dashboard',
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password' };
        default:
          return { error: 'Authentication failed. Please try again.' };
      }
    }
    // Re-throw NEXT_REDIRECT errors
    throw error;
  }
}
