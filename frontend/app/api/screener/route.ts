import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import axios from "axios";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const symbols = ["RELIANCE.NS", "INFY.NS", "HDFCBANK.NS"];
  let data: any[] = [];

  for (let symbol of symbols) {
    const resp = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHA_KEY}`
    );
    data.push({ symbol, raw: resp.data });
  }

  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an AI stock screener." },
      { role: "user", content: `Analyze these stocks and rank best trades:\n${JSON.stringify(data)}` }
    ]
  });

  res.json({ screener: ai.choices[0].message?.content });
}
