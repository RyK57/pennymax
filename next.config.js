/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * /api/* is proxied to Flask by app/api/[...slug]/route.ts (Node runtime).
   * Avoid NODE_ENV-based rewrites here: during `next build`, NODE_ENV is
   * production, which previously sent all API traffic to `/api/` and caused 404s.
   */
}

module.exports = nextConfig
