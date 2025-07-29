// app/api/live-stock-data/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols") || "AAPL,MSFT";

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/live-stock-data?symbols=${symbols}`);
    if (!response.ok) {
      console.error(`[API Error]: Failed to fetch from FastAPI. Status: ${response.status}`);
      return NextResponse.json({ error: "Failed to fetch from FastAPI" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
