import { createClient } from "@/src/lib/supabase/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.supabaseUserId, authUser.id))
    .limit(1);

  return user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}
