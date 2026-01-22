import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { UserRole } from "@/src/db/schema/enums";

export async function getAllAdmins() {
  return await db
    .select()
    .from(users)
    .where(eq(users.role, UserRole.ADMIN));
}

export async function getAllUsers() {
  return await db.select().from(users);
}

