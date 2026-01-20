import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/src/lib/auth/helpers";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
          <p className="mt-2 text-muted-foreground">
            Faça login para acessar sua conta
          </p>
        </div>

        {searchParams.message && (
          <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-blue-800 text-sm">
            {searchParams.message}
          </div>
        )}

        <LoginForm />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Não tem uma conta? </span>
          <Link href="/register" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
