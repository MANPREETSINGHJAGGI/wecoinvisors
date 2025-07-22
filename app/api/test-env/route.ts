// /app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    twelveKey: process.env.TWELVE_API_KEY,
    alphaKey: process.env.ALPHA_VANTAGE_API_KEY,
  });
}
