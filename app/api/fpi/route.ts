import { db } from "@/utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.date) {
      return Response.json(
        { success: false, error: "Invalid payload." },
        { status: 400 }
      );
    }

    const fpiData = {
      ...data,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "fpiData"), fpiData);
      return Response.json({ success: true });
    } catch (error) {
      console.error("Firestore write failed:", error);
      return Response.json(
        { success: false, error: "Failed to store FPI data" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("FPI API Error:", err);
    return Response.json(
      { success: false, error: "Failed to parse request." },
      { status: 500 }
    );
  }
}
