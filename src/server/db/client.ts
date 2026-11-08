import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalForDb = globalThis as unknown as {
  crmDb?: PrismaClient;
};
let productionDb: PrismaClient | undefined;

function createDb(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL ausente. Configure o ambiente local.");
  }
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL invalida; confira o formato sem compartilhar a senha.");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      url.username !== "crmapp" || url.hostname !== "192.168.100.15" ||
      (url.port || "5432") !== "5432" || url.pathname !== "/crmOD-db") {
    throw new Error("DATABASE_URL deve apontar para crmapp em 192.168.100.15:5432/crmOD-db.");
  }
  const adapter = new PrismaPg({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });
  return new PrismaClient({ adapter });
}

export function getDb(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return productionDb ??= createDb();
  }
  return globalForDb.crmDb ??= createDb();
}
