import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // TODO: REVOKE BEFORE PRODUCTION — temporary admin user for bootstrapping
  const adminEmail = process.env['SEED_ADMIN_EMAIL'] ?? 'luxcium_tmp@local.dev';
  const adminPassword = process.env['SEED_ADMIN_PASSWORD'] ?? 'pass_UNSAFE_tmp'; // TODO: REVOKE BEFORE PRODUCTION

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  // TODO: REVOKE BEFORE PRODUCTION — upsert luxcium_tmp admin user
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash, role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: 'Temp Admin', // TODO: REVOKE BEFORE PRODUCTION
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin user seeded: ${adminEmail}`);

  // Standard test user
  const testPasswordHash = await bcrypt.hash('testpassword123', 12);
  await prisma.user.upsert({
    where: { email: 'user@local.dev' },
    update: {},
    create: {
      email: 'user@local.dev',
      name: 'Test User',
      passwordHash: testPasswordHash,
      role: Role.USER,
    },
  });

  console.log('✅ Test user seeded: user@local.dev');
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
