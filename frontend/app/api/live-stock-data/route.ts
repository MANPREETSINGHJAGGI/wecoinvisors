// frontend/app/api/live-stock-data/route.ts

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols");

  if (!symbols) {
    return new Response(JSON.stringify({ error: "Missing 'symbols' parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use absolute URL for backend
  const backendBaseUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

  try {
    // Use absolute URL here!
    const res = await fetch(`${backendBaseUrl}/api/live-stock-data?symbols=${encodeURIComponent(symbols)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend Error:", errorText);
      return new Response(JSON.stringify({ error: "Backend API error" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fetch failed:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stock data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
