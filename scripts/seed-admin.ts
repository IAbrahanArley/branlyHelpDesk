import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { UserRole } from "../src/db/schema/enums";
import { eq } from "drizzle-orm";

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL não está configurada");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não está configurada");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedAdmin() {
  const email = "abrahanarley@gmail.com";
  const password = "99728251Aa@";
  const name = "Admin";

  try {
    console.log("Criando usuário admin...");

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("Usuário já existe. Atualizando role para ADMIN...");
      
      await db
        .update(users)
        .set({ role: UserRole.ADMIN })
        .where(eq(users.id, existingUser[0].id));

      console.log("✅ Usuário atualizado para ADMIN com sucesso!");
      console.log(`Email: ${email}`);
      return;
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Erro ao criar usuário no Supabase Auth: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error("Usuário não foi criado no Supabase Auth");
    }

    console.log("Usuário criado no Supabase Auth. Criando perfil...");

    const [userProfile] = await db
      .insert(users)
      .values({
        email,
        name,
        role: UserRole.ADMIN,
        supabaseUserId: authUser.user.id,
      })
      .returning();

    if (!userProfile) {
      throw new Error("Erro ao criar perfil do usuário");
    }

    console.log("✅ Usuário admin criado com sucesso!");
    console.log(`Email: ${email}`);
    console.log(`Nome: ${name}`);
    console.log(`Role: ADMIN`);
    console.log(`ID: ${userProfile.id}`);
  } catch (error) {
    console.error("❌ Erro ao criar usuário admin:", error);
    throw error;
  }
}

seedAdmin()
  .then(() => {
    console.log("\nSeed concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nErro ao executar seed:", error);
    process.exit(1);
  });
