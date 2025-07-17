// Script to create admin users with hashed passwords using Prisma
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Example admin users
const admins = [
  { username: 'alice', password: 'Alice@2025' },
  { username: 'bob', password: 'Bob#2025' },
  { username: 'carol', password: 'Carol$2025' },
  { username: 'dave', password: 'Dave%2025' },
  { username: 'eve', password: 'Eve!2025' },
];

async function main() {
  for (const admin of admins) {
    const hashed = await bcrypt.hash(admin.password, 10);
    await prisma.admin.upsert({
      where: { username: admin.username },
      update: {},
      create: {
        username: admin.username,
        password: hashed,
      },
    });
    console.log(`Created admin: ${admin.username}`);
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
