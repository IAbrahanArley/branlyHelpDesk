"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { loginSchema, registerSchema } from "@/src/lib/validators/auth";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { UserRole } from "@/src/db/schema/enums";
import { eq } from "drizzle-orm";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const validation = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
    };
  }

  const { email, password } = validation.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (!data.user) {
    return {
      error: "Erro ao fazer login",
    };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.supabaseUserId, data.user.id))
    .limit(1);

  if (!user) {
    return {
      error: "Usuário não encontrado",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const validation = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
    };
  }

  const { name, email, password } = validation.data;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return {
      error: authError.message,
    };
  }

  if (!authData.user) {
    return {
      error: "Erro ao criar usuário",
    };
  }

  try {
    await db.insert(users).values({
      email,
      name,
      supabaseUserId: authData.user.id,
      role: UserRole.USER,
    });
  } catch (error) {
    return {
      error: "Erro ao criar perfil do usuário. Tente novamente.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Usuário criado com sucesso. Faça login.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
