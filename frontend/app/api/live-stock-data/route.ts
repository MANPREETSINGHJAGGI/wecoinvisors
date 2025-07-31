// File: app/api/live-stock-data/route.ts

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbols = searchParams.get("symbols");

  if (!symbols) {
    return new Response(JSON.stringify({ error: "Missing 'symbols' parameter" }), {
      status: 400,
    });
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/live-stock-data?symbols=${symbols}`, {
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
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (error) {
    console.error("Fetch failed:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stock data" }), {
      status: 500,
    });
  }
}
