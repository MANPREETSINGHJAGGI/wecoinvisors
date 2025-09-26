// File: frontend/app/api/live-stock-data/route.ts
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.wecoinvisors.com";

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

    const backendJson = await res.json();

    // ✅ Always unwrap to { data: [...] }
    const data = Array.isArray(backendJson.data)
      ? backendJson.data
      : backendJson;

    return NextResponse.json({ data });
  } catch (err) {
    console.error("⚠️ Error in live-stock-data route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
