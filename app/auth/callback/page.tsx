import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

interface AuthCallbackPageProps {
  searchParams: Promise<{ code?: string; next?: string }>;
}

export default async function AuthCallbackPage({
  searchParams,
}: AuthCallbackPageProps) {
  const params = await searchParams;
  const code = params.code;
  const nextParam = params.next;

  if (!code) {
    redirect("/auth/error");
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirect("/auth/error");
  }

  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/main";
  redirect(next);
}
