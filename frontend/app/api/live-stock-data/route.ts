// File: frontend/app/api/live-stock-data/route.ts
import { NextResponse } from "next/server";

const isVercel = !!process.env.VERCEL;
const API_BASE = isVercel
  ? "https://api.wecoinvisors.com" // production
  : "http://127.0.0.1:8000";       // local FastAPI backend

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols") || "ITC,PNB";

    const res = await fetch(`${API_BASE}/live-stock-data?symbols=${symbols}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Backend API failed" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Always return unified shape { data: [...] }
    if (Array.isArray(data.data)) {
      return NextResponse.json({ data: data.data });
    }
    return NextResponse.json({ data: [] });
  } catch (err) {
    console.error("⚠️ Error in live-stock-data route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
