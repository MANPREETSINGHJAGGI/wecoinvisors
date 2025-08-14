import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "https://wecoinvisors.onrender.com";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols"); // optional

    // Build backend API URL
    let apiUrl = `${BACKEND_BASE_URL}/api/live-stock-data`;
    if (symbols && symbols.trim() !== "") {
      apiUrl += `?symbols=${encodeURIComponent(symbols)}`;
    }
    // If no symbols are provided, backend will return default list

    // Fetch from FastAPI backend
    const res = await fetch(apiUrl, {
      cache: "no-store", // always get fresh prices
    });

    if (!res.ok) {
      throw new Error(`Backend API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching live stock data:", error);
    return NextResponse.json(
      { error: "Failed to fetch live stock data" },
      { status: 500 }
    );
  }
}
