import { PrismaClient } from "./generated/prisma/client";

declare global {
  var prisma: PrismaClient;
}

const prisma = global.prisma

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
