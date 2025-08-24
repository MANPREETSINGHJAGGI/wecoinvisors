// File: frontend/app/api/historical-chart/route.ts

import { NextResponse } from "next/server";

// ⚡ Base URL of your FastAPI backend
const BACKEND_URL =
  process.env.BACKEND_URL || "http://127.0.0.1:8000"; // Local dev fallback

/**
 * Proxy for historical stock data from FastAPI backend.
 * Example: /api/historical-chart?symbol=RELIANCE.NS&range=6mo&interval=1d
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const symbol = searchParams.get("symbol");
    const range = searchParams.get("range") || "6mo"; // default range
    const interval = searchParams.get("interval") || "1d"; // default interval

    if (!symbol) {
      return NextResponse.json(
        { error: "symbol query param is required" },
        { status: 400 }
      );
    }

    // Build backend request URL
    const url = `${BACKEND_URL}/api/historical-chart?symbol=${encodeURIComponent(
      symbol
    )}&range=${encodeURIComponent(range)}&interval=${encodeURIComponent(
      interval
    )}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("⚠️ Frontend historical-chart proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch historical chart data" },
      { status: 500 }
    );
  }
}
