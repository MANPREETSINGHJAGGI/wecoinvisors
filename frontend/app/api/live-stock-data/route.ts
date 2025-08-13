// frontend/app/api/live-stock-data/route.ts
export const dynamic = 'force-dynamic'; // do not prerender, run on-demand
export const revalidate = 0; // always fetch fresh

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/live-stock-data');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch live stock data' }, { status: 500 });
  }
}
