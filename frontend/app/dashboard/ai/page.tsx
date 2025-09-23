"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.wecoinvisors.com";

export default function AiAnalysis() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch(`${API_BASE}/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.ok) setResult(data.content);
      else setResult("⚠ " + (data.error || "Error from backend"));
    } catch (err) {
      setResult("⚠ Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🤖 AI Stock Analysis</h1>
      <textarea
        className="w-full p-3 border border-gold rounded mb-4 text-black"
        rows={4}
        placeholder="Ask AI about stocks..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={analyze}
        className="bg-gold text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <div className="mt-6 p-4 border border-gold rounded bg-black/50 text-wecoin-blue">
          <h2 className="font-bold mb-2">📊 AI Analysis:</h2>
          <p>{result}</p>
        </div>
      )}
    </main>
  );
}
