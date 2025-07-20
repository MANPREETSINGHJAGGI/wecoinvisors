// /app/api/live-stock-data/route.ts  or  /pages/api/live-stock-data.ts (based on your structure)
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols") || "";

  const fastapiUrl = `http://127.0.0.1:8000/stock-data?symbols=${symbols}`;
  try {
    const response = await fetch(fastapiUrl);
    const data = await response.json();

    return Response.json({ success: true, data });
  } catch (err) {
    console.error("❌ Failed to fetch from FastAPI:", err);
    return Response.json({ success: false, error: "FastAPI fetch failed" }, { status: 500 });
  }
}
