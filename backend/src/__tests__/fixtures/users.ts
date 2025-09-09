import { UserRole } from '@prisma/client';
import { hashPassword } from '../../lib/auth';

export interface UserFixture {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export const userFixtures: UserFixture[] = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'admin123',
    role: UserRole.ADMIN
  },
  {
    email: 'manager@example.com',
    name: 'Manager User',
    password: 'manager123',
    role: UserRole.MANAGER
  },
  {
    email: 'user@example.com',
    name: 'Regular User',
    password: 'user123',
    role: UserRole.USER
  },
  {
    email: 'user2@example.com',
    name: 'Second User',
    password: 'user123',
    role: UserRole.USER
  },
  {
    email: 'test@example.com',
    name: 'Test User',
    password: 'test123',
    role: UserRole.USER
  }
];

export const createUserFixture = async (fixture: UserFixture) => {
  const hashedPassword = await hashPassword(fixture.password);
  return {
    email: fixture.email,
    name: fixture.name,
    password: hashedPassword,
    role: fixture.role
  };
};

export const createAllUserFixtures = async () => {
  const users = [];
  for (const fixture of userFixtures) {
    users.push(await createUserFixture(fixture));
  }
  return users;
};