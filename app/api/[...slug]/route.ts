import { NextRequest, NextResponse } from "next/server"

/** Flask base URL (no trailing slash). Same default as package.json flask-dev port. */
const flaskOrigin =
  process.env.FLASK_API_ORIGIN?.replace(/\/$/, "") || "http://127.0.0.1:5328"

export const runtime = "nodejs"

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
])

function buildTargetUrl(slug: string[], search: string): string {
  const path = slug.length ? slug.join("/") : ""
  const apiPath = path ? `/api/${path}` : "/api"
  return `${flaskOrigin}${apiPath}${search}`
}

function forwardHeaders(req: NextRequest): Headers {
  const out = new Headers()
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (k === "host" || HOP_BY_HOP.has(k)) return
    out.set(key, value)
  })
  return out
}

async function proxy(req: NextRequest, slug: string[]): Promise<NextResponse> {
  const url = buildTargetUrl(slug, req.nextUrl.search)
  const headers = forwardHeaders(req)

  const init: RequestInit = {
    method: req.method,
    headers,
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer()
  }

  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not reach the game API. Start Flask (e.g. pnpm run flask-dev on port 5328) or set FLASK_API_ORIGIN.",
      },
      { status: 502 }
    )
  }

  const resHeaders = new Headers(res.headers)
  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  })
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await ctx.params
  return proxy(req, slug)
}

export async function HEAD(
  req: NextRequest,
  ctx: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await ctx.params
  return proxy(req, slug)
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await ctx.params
  return proxy(req, slug)
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await ctx.params
  return proxy(req, slug)
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await ctx.params
  return proxy(req, slug)
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await ctx.params
  return proxy(req, slug)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
    },
  })
}
