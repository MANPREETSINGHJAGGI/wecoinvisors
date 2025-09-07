"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function AIInsightsPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskAI = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResponse("");

    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();
      setResponse(data.answer || "No response received.");
    } catch (err: any) {
      console.error(err);
      setError("Unable to fetch AI insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">AI Stock Assistant</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-medium">Ask AI about Stocks</h2>
          <p className="text-sm text-gray-500">
            Example: "Tell me about RELIANCE" or "Best stocks for long-term investment"
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Textarea
              placeholder="Type your question about stocks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              rows={3}
            />
            <Button onClick={handleAskAI} disabled={loading} className="w-full md:w-40">
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Thinking...
                </>
              ) : (
                "Ask AI"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && !response && (
        <div className="text-gray-500 text-center">AI is analyzing your question...</div>
      )}

      {response && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">AI Insights</h3>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-gray-700">{response}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
