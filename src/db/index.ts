import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

function getDatabase() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    if (!connectionString.startsWith("postgresql://") && !connectionString.startsWith("postgres://")) {
      throw new Error("DATABASE_URL must start with postgresql:// or postgres://");
    }

    try {
      _client = postgres(connectionString, { 
        max: 1,
        connect_timeout: 10,
        idle_timeout: 20,
      });
      _db = drizzle(_client, { schema });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating database connection:", errorMessage);
      console.error("Connection string format:", connectionString ? `${connectionString.substring(0, 20)}...` : "empty");
      throw new Error(`Failed to create database connection: ${errorMessage}. Please check your DATABASE_URL environment variable.`);
    }
  }

  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    try {
      return getDatabase()[prop as keyof ReturnType<typeof drizzle>];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Database access error:", errorMessage);
      throw error;
    }
  },
});

export * from "./schema";