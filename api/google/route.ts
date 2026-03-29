import { NextRequest, NextResponse } from "next/server";
import {
  checkAuthRateLimit,
  recordAuthAttempt,
  getClientIdentifier,
} from "@/db/auth/rate_limits";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/** Rate-limited Google OAuth initiation. Use this instead of client-side signInWithOAuth. */
export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const adminClient = createAdminClient();

  if (adminClient) {
    const limitResult = await checkAuthRateLimit(adminClient, identifier, "login_init");
    if (!limitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          retryAfterSec: limitResult.retryAfterSec,
        },
        { status: 429 }
      );
    }
  }

  const next = request.nextUrl.searchParams.get("next") ?? "/main";
  const sanitizedNext = next.startsWith("/") ? next : "/main";

  // request.nextUrl.origin can be localhost in production (Next.js/Vercel quirk).
  // Prefer x-forwarded headers, then BASE_URL/NEXT_PUBLIC_APP_URL env.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const baseUrl =
    forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : process.env.BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const redirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;
  const callbackUrl =
    sanitizedNext !== "/main"
      ? `${redirectTo}?next=${encodeURIComponent(sanitizedNext)}`
      : redirectTo;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
    return NextResponse.json(
      { error: "Auth not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(await cookies());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (adminClient) {
    await recordAuthAttempt(adminClient, identifier, "login_init");
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.url) {
    return NextResponse.json(
      { error: "Failed to get OAuth URL" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}
