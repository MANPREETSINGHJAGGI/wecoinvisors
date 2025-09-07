"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  headline: string;
  source: string;
  url: string;
  datetime: number; // Unix timestamp
  sentiment: "positive" | "negative" | "neutral";
}

interface NewsSentimentProps {
  news: NewsItem[];
  title?: string;
}

export default function NewsSentiment({ news, title = "Latest News" }: NewsSentimentProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-700";
      case "negative":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {news.length === 0 ? (
        <p className="text-gray-500 text-center">No news available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item, idx) => (
            <Card
              key={idx}
              className="hover:shadow-lg transition cursor-pointer"
              onClick={() => window.open(item.url, "_blank")}
            >
              <CardHeader className="flex flex-col gap-2">
                <h3 className="text-base font-semibold">{item.headline}</h3>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span>{formatDate(item.datetime)}</span>
                </div>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Badge className={`${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
