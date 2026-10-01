import { PrismaClient } from "@prisma/client";

// Next dev reloads modules on every edit; without caching this on globalThis
// each reload would open a new pool and exhaust Postgres connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // KPP_LOG_QUERIES=1 logs every statement, which is how page-level query
    // counts get measured. A query against a database on the same machine is
    // nearly free and one against a hosted database is a network round trip,
    // so a count that looks harmless locally is the page time in production.
    log: process.env.KPP_LOG_QUERIES
      ? ["query"]
      : process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
