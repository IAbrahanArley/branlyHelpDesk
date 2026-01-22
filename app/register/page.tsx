import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Criar conta</h1>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados para criar sua conta
          </p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Já tem uma conta? </span>
          <Link href="/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}

