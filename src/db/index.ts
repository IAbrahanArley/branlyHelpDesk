import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

function validateConnectionString(connectionString: string): void {
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!connectionString.startsWith("postgresql://") && !connectionString.startsWith("postgres://")) {
    throw new Error(`DATABASE_URL must start with postgresql:// or postgres://. Found: ${connectionString.substring(0, 15)}...`);
  }

  try {
    const url = new URL(connectionString);
    
    if (!url.hostname) {
      throw new Error("DATABASE_URL is missing hostname");
    }
    
    if (!url.username && !url.pathname.includes("@")) {
      throw new Error("DATABASE_URL is missing username");
    }
    
    if (!url.pathname || url.pathname === "/") {
      throw new Error("DATABASE_URL is missing database name");
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Invalid URL")) {
      throw new Error(`DATABASE_URL is not a valid URL. Please check the format. Example: postgresql://user:password@host:port/database`);
    }
    throw error;
  }
}

function getDatabase() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL?.trim();

    try {
      validateConnectionString(connectionString || "");
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : "Unknown validation error";
      console.error("DATABASE_URL validation error:", errorMessage);
      throw new Error(`Invalid DATABASE_URL: ${errorMessage}. Please check your environment variable configuration.`);
    }

    try {
      const url = new URL(connectionString!);
      const isDirectConnection = url.port === "5432" || (!url.port && url.hostname.includes("db."));
      
      if (isDirectConnection && process.env.NODE_ENV === "production") {
        console.warn("⚠️  Using direct database connection (port 5432) in production. Consider using Connection Pooling (port 6543) for better performance and reliability.");
      }

      _client = postgres(connectionString!, { 
        max: 1,
        connect_timeout: 30,
        idle_timeout: 20,
        max_lifetime: 60 * 30,
        onnotice: () => {},
      });
      _db = drizzle(_client, { schema });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating database connection:", errorMessage);
      
      const urlPreview = connectionString ? (() => {
        try {
          const url = new URL(connectionString);
          return `postgresql://${url.username ? url.username + '@' : ''}${url.hostname}${url.port ? ':' + url.port : ''}${url.pathname}`;
        } catch {
          return connectionString.substring(0, 50) + '...';
        }
      })() : "empty";
      
      console.error("Connection string preview:", urlPreview);
      throw new Error(`Failed to create database connection: ${errorMessage}. Please verify your DATABASE_URL format and credentials.`);
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