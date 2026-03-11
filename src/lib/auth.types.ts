export type UserRole = 'USER' | 'ADMIN';

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
}

/** Loose shape used when casting `session.user` from NextAuth's base type. */
export type ExtendedUser = {
  id?: string;
  role?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

/** Shape stored in the JWT token after augmentation. */
export type AugmentedToken = {
  id?: string;
  role?: string;
  [key: string]: unknown;
};
