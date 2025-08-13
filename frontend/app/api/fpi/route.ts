// frontend/app/api/fpi/route.ts

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/fpi', {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching FPI data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FPI data' },
      { status: 500 }
    );
  }
}
