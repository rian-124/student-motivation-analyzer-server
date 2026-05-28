import { Role } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  role: Role;
  email?: string;
  name?: string;
};
