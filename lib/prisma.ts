import { PrismaClient } from "./generated/prisma/client";

declare global {
  // allow global `var` in dev to persist PrismaClient across module reloads
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
