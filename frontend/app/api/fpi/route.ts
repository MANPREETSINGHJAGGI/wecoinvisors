// frontend/app/api/fpi/route.ts

export async function GET(request: Request) {
  try {
   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
await fetch(`${baseUrl}/api/fpi?provider=dual`);
    if (!res.ok) {
      const text = await res.text();
      console.error("FPI API Error Response:", text);
      return new Response("Error fetching data", { status: 500 });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("FPI API Fetch Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
