// FILE: app/api/ai-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { symbol = "AAPL", quote, news } = body;
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

    const system = `You are an equity analyst. Be concise, avoid speculation, and never give financial advice. Output sections: Snapshot, Drivers, Risks, Technicals(brief), TL;DR (max 20 words).`;
    const user = `Symbol: ${symbol}\nQuote: ${JSON.stringify(quote)}\nNews: ${news?.map((n: any) => `- ${n.title}`).join("\n")}`;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.3
    });

    const text = res.choices[0]?.message?.content || "No analysis";
    return NextResponse.json({ ok: true, data: text });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
