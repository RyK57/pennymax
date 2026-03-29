import type { SupabaseClient, Session } from "@supabase/supabase-js";


/**
 * Checks if a user is logged in and returns their user details (session/user object).
 * If not logged in, returns null.
 *
 * @param {SupabaseClient} supabase - Supabase client instance
 * @returns {Promise<{ user: any; session: Session } | null>}
 */
export async function getLoggedInUser(supabase: SupabaseClient): Promise<{ user: any; session: Session } | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session || !session.user) {
    return null;
  }
  return { user: session.user, session };
}

/**
 * Use inside a server/page/route handler to guard pages that require authentication.
 * Redirects or throws if the user is not logged in.
 * (Adapt the redirect logic for your framework usage.)
 *
 * @param {SupabaseClient} supabase - Supabase client instance
 * @returns {Promise<{ user: any; session: Session }>} - Throws if not logged in.
 */
export async function requireAuth(supabase: SupabaseClient): Promise<{ user: any; session: Session }> {
  const result = await getLoggedInUser(supabase);
  if (!result) {
    // Optionally, throw or redirect; here we throw:
    throw new Error('Unauthorized: User must be logged in');
  }
  return result;
}



export async function generateNonce(): Promise<[string, string]> {
  // Generate a random string as nonce
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = btoa(String.fromCharCode(...Array.from(bytes)));
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [nonce, hashedNonce];
}

/**
 * Signs in with Google using ID token from Google One Tap and Supabase.
 * @param {Object} param0
 * @param {import("@supabase/supabase-js").SupabaseClient} param0.supabase - Supabase client instance
 * @param {string} param0.idToken - Google ID token (credential)
 * @param {string} param0.nonce - Raw nonce (unhashed, the original string you generated)
 * @returns {Promise<import("@supabase/supabase-js").AuthResponse>}
 */
export async function signInWithGoogleIdToken({
  supabase,
  idToken,
  nonce,
}: {
  supabase: SupabaseClient;
  idToken: string;
  nonce: string;
}) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
    nonce,
  });
  return { data, error };
}

/**
 * (For full redirect OAuth flow) Signs in with Google via Supabase and retrieves provider tokens.
 * Use access_type: 'offline' & prompt: 'consent' to get Google refresh tokens.
 * NOTE: You must invoke this server-side or client-side depending on your app flow.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @returns {Promise<import("@supabase/supabase-js").AuthResponse>}
 */
export async function signInWithGoogleOAuth(supabase: SupabaseClient) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
}

/**
 * Signs in with Google via redirect (PKCE flow). Use for web apps with a callback route.
 * The browser redirects to Google, then to your callback which exchanges the code for a session.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} redirectTo - Full callback URL (e.g. https://example.com/auth/callback)
 * @param {string} [next] - Path to redirect after success (e.g. /dashboard)
 * @returns {Promise<import("@supabase/supabase-js").AuthResponse>}
 */
export async function signInWithGoogleRedirect(
  supabase: SupabaseClient,
  redirectTo: string,
  next = "/"
) {
  const callbackUrl =
    next !== "/" ? `${redirectTo}?next=${encodeURIComponent(next)}` : redirectTo;
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
    },
  });
}

/**
 * Exchanges OAuth code for session (PKCE flow). Call from your callback route.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} code - Auth code from URL params
 * @returns {Promise<{ error: import("@supabase/supabase-js").AuthError | null }>}
 */
export async function exchangeCodeForSession(
  supabase: SupabaseClient,
  code: string
) {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error };
}

/**
 * Extract Google OAuth tokens from the Supabase session (after sign-in).
 * @param {object} session - Supabase session object
 * @returns {{
 *   accessToken?: string,
 *   refreshToken?: string,
 *   expiresAt?: number
 * }}
 */
export function extractGoogleProviderTokens(session: Session | null) {
  if (!session || !("provider_token" in session)) return {};
  const s = session as Session & {
    provider_token?: string;
    provider_refresh_token?: string;
    provider_token_expires_at?: number;
  };
  return {
    accessToken: s.provider_token,
    refreshToken: s.provider_refresh_token,
    expiresAt: s.provider_token_expires_at,
  };
}

/**
 * Signs out the current user and clears the session.
 * Call from client components; after signOut, redirect to /auth/login or /.
 *
 * @param supabase - Supabase client instance (use createClient from utils/supabase/client)
 * @returns Promise<{ error: AuthError | null }>
 */
export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  return { error };
}


