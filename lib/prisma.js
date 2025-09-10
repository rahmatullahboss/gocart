import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient instance in dev to avoid connection issues
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
