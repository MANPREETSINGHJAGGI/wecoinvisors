import { google } from "googleapis";
import { NextResponse } from "next/server";

const SHEET_ID = "1LkxYQ-eyqGUZurMn-_si5XxbzSQAvyRHVz3jpncd0t4"; // your sheet ID
const RANGE = "Sheet1!A:Z"; // adjust if needed

export async function GET() {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values || [];
    if (!rows.length) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    // First row = headers, rest = data
    const headers = rows[0];
    const records = rows.slice(1).map((row) =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] || ""]))
    );

    return NextResponse.json({ headers, records });
  } catch (err) {
    console.error("⚠️ Sheets API error:", err);
    return NextResponse.json({ error: "Failed to fetch sheet" }, { status: 500 });
  }
}
