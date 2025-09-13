import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const symbols = ["RELIANCE.NS", "INFY.NS", "HDFCBANK.NS"];
  let data: any[] = [];

  for (let symbol of symbols) {
    const resp = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_KEY}`
    );
    data.push({ symbol, raw: resp.data });
  }

  // Simple fallback screener without AI
  const ranked = data.map((s) => {
    const series = s.raw["Time Series (Daily)"];
    if (!series) return { symbol: s.symbol, score: -Infinity };
    const latest = Object.values(series)[0] as any;
    const change =
      parseFloat(latest["4. close"]) - parseFloat(latest["1. open"]);
    return { symbol: s.symbol, score: change };
  });

  ranked.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    message: "Simple screener (no OpenAI API key configured)",
    ranked,
  });
}
