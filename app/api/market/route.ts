import { db } from "@/utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.nifty || !data.sensex) {
      return Response.json(
        { success: false, error: "Invalid market payload." },
        { status: 400 }
      );
    }

    const marketData = {
      ...data,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "marketData"), marketData);
      return Response.json({ success: true });
    } catch (error) {
      console.error("Firestore write failed:", error);
      return Response.json(
        { success: false, error: "Market store error" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Market API Error:", err);
    return Response.json(
      { success: false, error: "Failed to parse market data." },
      { status: 500 }
    );
  }
}
