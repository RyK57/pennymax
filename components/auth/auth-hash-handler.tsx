"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * Handles OAuth redirects that land with tokens in the URL hash (implicit flow).
 * Supabase should use PKCE (code in query) when configured correctly, but this
 * fallback ensures users aren't stuck on the home page with tokens in the URL.
 */
export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) return;

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(() => {
        const next = params.get("next") ?? "/main";
        const target = next.startsWith("/") ? next : "/main";
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(target);
      })
      .catch(() => {
        window.history.replaceState(null, "", window.location.pathname);
        router.replace("/auth/auth-code-error");
      });
  }, [router]);

  return null;
}
