// ─── Proxy API Route ────────────────────────────────────────
// Forwards requests from the frontend to the Railway backend,
// avoiding CORS issues since this runs server-side.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://kuliner-backend-production-38c5.up.railway.app";

async function proxyRequest(req: NextRequest) {
  // Extract the path after /api/proxy/
  const url = new URL(req.url);
  const pathAfterProxy = url.pathname.replace(/^\/api\/proxy/, "");
  const targetUrl = `${BACKEND_URL}${pathAfterProxy}${url.search}`;

  // Forward headers (except host)
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers[key] = value;
    }
  });

  // Read body for non-GET requests
  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      const text = await req.text();
      body = text === "" ? undefined : text;
    } catch {
      // no body
    }
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Read response
    const responseBody = await backendRes.text();

    // Create response with same status and headers
    const response = new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
    });

    // Copy content-type from backend
    const contentType = backendRes.headers.get("content-type");
    if (contentType) {
      response.headers.set("content-type", contentType);
    }

    return response;
  } catch (error) {
    console.error("[Proxy] Error forwarding request:", error);
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req);
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req);
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req);
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req);
}
