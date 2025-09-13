import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1LkxYQ-eyqGUZurMn-_si5XxbzSQAvyRHVz3jpncd0t4",
      range: "A:Z", // fetch all columns dynamically
    });

    const rows = response.data.values || [];

    return NextResponse.json({ rows });
  } catch (err: any) {
    console.error("⚠️ Google Sheets fetch failed:", err.message);
    return NextResponse.json({ error: "Failed to fetch sheet" }, { status: 500 });
  }
}
