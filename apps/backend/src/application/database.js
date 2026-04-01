import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

const isDev = process.env.NODE_ENV !== "production";
const enableQueryLog = process.env.PRISMA_DEBUG === "true";

const globalForPrisma = globalThis;

/**
 * Factory function to create a new Prisma Client instance
 * @returns {PrismaClient} Prisma client instance
 */
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: enableQueryLog ? ["query", "error", "warn"] : ["error"],
  });

  if (isDev && enableQueryLog) {
    client.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;

      logger.debug(`Prisma ${params.model}.${params.action} - ${duration}ms`);
      return result;
    });
  }

  return client;
};

/**
 * Global Prisma client instance
 * Uses globalThis to persist the instance during hot-reload
 *
 * @type {PrismaClient}
 */
export const prisma = globalForPrisma.prisma || createPrismaClient();

if (isDev) {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper function to get the Prisma client
 *
 * @returns {PrismaClient} Prisma client instance with all models
 */
export const getPrisma = () => /** @type {PrismaClient} */ (prisma);
