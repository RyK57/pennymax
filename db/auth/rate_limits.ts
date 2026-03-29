import type { SupabaseClient } from "@supabase/supabase-js";

/** Max auth attempts (login/callback) per IP per window */
export const AUTH_ATTEMPTS_LIMIT = 10;

/** Window duration in seconds (15 min) */
export const AUTH_RATE_WINDOW_SEC = 15 * 60;

export type AuthAction = "callback" | "login_init";

/** Contact: 5 submissions per hour per IP */
export const CONTACT_ATTEMPTS_LIMIT = 5;
export const CONTACT_RATE_WINDOW_SEC = 60 * 60;

function hashIdentifier(ip: string, prefix = "auth"): string {
  return `${prefix}:${ip}`;
}

/**
 * Check if IP has exceeded auth rate limit. Uses sliding window.
 * Returns { allowed, retryAfterSec }.
 */
export async function checkAuthRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  action: AuthAction = "callback"
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const key = hashIdentifier(identifier, "auth");

  const { data, error } = await supabase
    .from("auth_rate_limits")
    .select("count, window_start")
    .eq("identifier", key)
    .eq("action_type", action)
    .maybeSingle();

  if (error) {
    console.error("[auth/rate_limits] check error:", error);
    return { allowed: true }; // Fail open
  }

  const now = new Date();
  const windowStart = data?.window_start ? new Date(data.window_start) : now;
  const count = data?.count ?? 0;
  const elapsedSec = (now.getTime() - windowStart.getTime()) / 1000;

  if (elapsedSec >= AUTH_RATE_WINDOW_SEC) {
    return { allowed: true };
  }

  if (count >= AUTH_ATTEMPTS_LIMIT) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil(AUTH_RATE_WINDOW_SEC - elapsedSec),
    };
  }

  return { allowed: true };
}

/**
 * Record an auth attempt. Call after each auth attempt (success or fail).
 */
export async function recordAuthAttempt(
  supabase: SupabaseClient,
  identifier: string,
  action: AuthAction = "callback"
): Promise<void> {
  const key = hashIdentifier(identifier, "auth");

  const { data: existing } = await supabase
    .from("auth_rate_limits")
    .select("count, window_start")
    .eq("identifier", key)
    .eq("action_type", action)
    .maybeSingle();

  const now = new Date();
  const windowStart = existing?.window_start ? new Date(existing.window_start) : now;
  const elapsedSec = (now.getTime() - windowStart.getTime()) / 1000;

  let newCount: number;
  let newWindowStart: Date;

  if (elapsedSec >= AUTH_RATE_WINDOW_SEC) {
    newCount = 1;
    newWindowStart = now;
  } else {
    newCount = (existing?.count ?? 0) + 1;
    newWindowStart = windowStart;
  }

  await supabase.from("auth_rate_limits").upsert(
    {
      identifier: key,
      action_type: action,
      count: newCount,
      window_start: newWindowStart.toISOString(),
      updated_at: now.toISOString(),
    },
    { onConflict: "identifier,action_type" }
  );
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

/** Check contact form rate limit. Uses same auth_rate_limits table with contact action. */
export async function checkContactRateLimit(
  supabase: SupabaseClient,
  identifier: string
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const key = hashIdentifier(identifier, "contact");

  const { data, error } = await supabase
    .from("auth_rate_limits")
    .select("count, window_start")
    .eq("identifier", key)
    .eq("action_type", "contact")
    .maybeSingle();

  if (error) {
    console.error("[contact/rate_limits] check error:", error);
    return { allowed: true };
  }

  const now = new Date();
  const windowStart = data?.window_start ? new Date(data.window_start) : now;
  const count = data?.count ?? 0;
  const elapsedSec = (now.getTime() - windowStart.getTime()) / 1000;

  if (elapsedSec >= CONTACT_RATE_WINDOW_SEC) {
    return { allowed: true };
  }

  if (count >= CONTACT_ATTEMPTS_LIMIT) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil(CONTACT_RATE_WINDOW_SEC - elapsedSec),
    };
  }

  return { allowed: true };
}

/** Record contact form submission. */
export async function recordContactAttempt(
  supabase: SupabaseClient,
  identifier: string
): Promise<void> {
  const key = hashIdentifier(identifier, "contact");

  const { data: existing } = await supabase
    .from("auth_rate_limits")
    .select("count, window_start")
    .eq("identifier", key)
    .eq("action_type", "contact")
    .maybeSingle();

  const now = new Date();
  const windowStart = existing?.window_start ? new Date(existing.window_start) : now;
  const elapsedSec = (now.getTime() - windowStart.getTime()) / 1000;

  let newCount: number;
  let newWindowStart: Date;

  if (elapsedSec >= CONTACT_RATE_WINDOW_SEC) {
    newCount = 1;
    newWindowStart = now;
  } else {
    newCount = (existing?.count ?? 0) + 1;
    newWindowStart = windowStart;
  }

  await supabase.from("auth_rate_limits").upsert(
    {
      identifier: key,
      action_type: "contact",
      count: newCount,
      window_start: newWindowStart.toISOString(),
      updated_at: now.toISOString(),
    },
    { onConflict: "identifier,action_type" }
  );
}
