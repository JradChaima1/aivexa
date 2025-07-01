import { PrismaClient } from "@prisma/client";
import { env } from "~/env";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function connectWithRetry(): Promise<PrismaClient> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const client = globalForPrisma.prisma ?? createPrismaClient();
      await client.$connect();
      if (env.NODE_ENV !== "production") globalForPrisma.prisma = client;
      console.log("✅ Connected to the database");
      return client;
    } catch (error) {
      console.warn(`❌ Database connection failed. Retry ${i + 1}/${MAX_RETRIES}`);
      if (i === MAX_RETRIES - 1) throw error;
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
    }
  }
  throw new Error("❌ Could not connect to database after retries.");
}

export const getDb = connectWithRetry; // <-- this is now a function, not a resolved value
