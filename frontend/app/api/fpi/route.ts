"use client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Example API response — replace with your logic or fetch from backend
    const data = {
      message: "FPI data endpoint is working",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/fpi:", error);
    return NextResponse.json(
      { error: "Failed to fetch FPI data" },
      { status: 500 }
    );
  }
}

