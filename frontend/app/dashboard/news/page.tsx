"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsItem {
  headline: string;
  source: string;
  summary: string;
  url: string;
  datetime: number; // timestamp in seconds
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/market-news");
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();
        setNews(data.news || []);
      } catch (err: any) {
        console.error(err);
        setError("Unable to load news at the moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Market News</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-full h-32 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : news.length === 0 ? (
        <p className="text-gray-500 text-center">No news available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item, idx) => (
            <Card
              key={idx}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => window.open(item.url, "_blank")}
            >
              <CardHeader>
                <h2 className="text-base font-semibold">{item.headline}</h2>
                <p className="text-xs text-gray-500">
                  {item.source} • {formatDate(item.datetime)}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">{item.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
