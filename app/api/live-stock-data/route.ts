import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols") || "";

  const fastapiUrl = `http://127.0.0.1:8000/stock-data?symbols=${symbols}`;

  try {
    const baseURL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000';
const response = await fetch(`${baseURL}/live-stock-data?symbols=${symbols}`);


    const data = await response.json();

    return Response.json({ success: true, data });
  } catch (err) {
    console.error("❌ Error fetching from FastAPI:", err);
    return Response.json({ success: false, error: "FastAPI fetch failed" }, { status: 500 });
  }
}
