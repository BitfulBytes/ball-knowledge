import { PrismaClient } from '@prisma/client';

const global = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
