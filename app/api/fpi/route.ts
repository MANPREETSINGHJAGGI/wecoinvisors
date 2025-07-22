export async function GET() {
  try {
    // Simulated FPI Data for Dev Mode
    const dummyFpi = {
      date: "2025-07-18",
      equityPurchase: 100000000,
      equitySale: 50000000,
      netInvestment: 50000000,
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: dummyFpi,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("FPI API Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Server error fetching FPI data" }),
      { status: 500 }
    );
  }
}
