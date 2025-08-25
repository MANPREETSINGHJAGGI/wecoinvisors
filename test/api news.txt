// FILE: app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") || "AAPL";
  try {
    // placeholder using Hacker News Algolia as free demo for symbol keyword
    const r = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(symbol)}&tags=story&hitsPerPage=5`, { next: { revalidate: 300 } });
    const j = await r.json();
    const items = (j.hits || []).map((h: any) => ({ title: h.title, url: h.url, source: "HN", ts: h.created_at_i }));
    return NextResponse.json({ ok: true, data: items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
