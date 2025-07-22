// app/api/stock/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const apiKey = process.env.TWELVE_API_KEY;

  const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "error") throw new Error(data.message);

    return Response.json({
      success: true,
      data: {
        name: data.name,
        price: data.close,
        change: data.percent_change,
      },
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
