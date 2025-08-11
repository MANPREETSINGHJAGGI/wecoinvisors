import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    return NextResponse.json({ data: { /* your FPI data */ }, trend: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
const res = await fetch("/api/fpi?provider=dual");
if (!res.ok) {
  const text = await res.text(); // 👈 log the HTML
  console.error("FPI API Error Response:", text);
  throw new Error(`HTTP ${res.status}`);
}
const json = await res.json();
