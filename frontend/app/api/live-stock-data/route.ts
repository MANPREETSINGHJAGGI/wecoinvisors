// File: frontend/app/api/live-stock-data/route.ts
import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols") || "ITC,PNB";
    const provider = searchParams.get("provider") || "backend";

    // ✅ Require symbols
    if (!symbols) {
      return NextResponse.json(
        { error: "Missing symbols parameter" },
        { status: 400 }
      );
    }

    // ✅ Backend provider (Render backend → no `/api` prefix)
    if (provider === "backend") {
      const res = await fetch(`${API_BASE}/live-stock-data?symbols=${symbols}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: "Backend API failed" },
          { status: res.status }
        );
      }

      return NextResponse.json(await res.json());
    }

    // ✅ Dual provider (Yahoo first, fallback to backend)
    if (provider === "dual") {
      try {
        const yahooRes = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbols}?interval=1d&range=5d`
        );

        if (yahooRes.ok) {
          const data = await yahooRes.json();
          return NextResponse.json({ provider: "yahoo", data });
        }
      } catch (err) {
        console.error("⚠️ Yahoo fetch failed, trying backend:", err);
      }

      const backendRes = await fetch(
        `${API_BASE}/live-stock-data?symbols=${symbols}`,
        { cache: "no-store" }
      );

      if (!backendRes.ok) {
        return NextResponse.json(
          { error: "Both Yahoo and Backend failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        provider: "backend",
        data: await backendRes.json(),
      });
    }

    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  } catch (err) {
    console.error("⚠️ Unexpected error in live-stock-data route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
