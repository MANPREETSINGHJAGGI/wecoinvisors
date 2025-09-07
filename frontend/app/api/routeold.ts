// File: app/api/live-stock-data/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbols = searchParams.get("symbols");
    const provider = searchParams.get("provider") || "backend"; // default = backend

    // In backend mode, we must have symbols
    if (!symbols && provider !== "dual") {
      return NextResponse.json(
        { error: "Missing symbols parameter" },
        { status: 400 }
      );
    }

    // ✅ Backend FastAPI provider
    if (provider === "backend") {
      const res = await fetch(
        `http://127.0.0.1:8000/api/live-stock-data?symbols=${symbols}`,
        { next: { revalidate: 10 } } // allow caching but refresh often
      );

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
      if (!symbols) {
        return NextResponse.json(
          { error: "Symbols required for dual mode" },
          { status: 400 }
        );
      }

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

      // fallback to backend
      const backendRes = await fetch(
        `http://127.0.0.1:8000/api/live-stock-data?symbols=${symbols}`
      );

      if (!backendRes.ok) {
        return NextResponse.json(
          { error: "Both Yahoo and Backend failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({ provider: "backend", data: await backendRes.json() });
    }

    // ❌ Invalid provider
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  } catch (err) {
    console.error("⚠️ Unexpected error in live-stock-data route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
