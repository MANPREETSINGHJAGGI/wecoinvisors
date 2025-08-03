interface LiveMarketDataProps {
  provider?: string;
}

export default function LiveMarketData({ provider }: LiveMarketDataProps) {
  console.log("Using provider:", provider || "default");

  return (
    <div>
      {/* Your live market data display logic */}
    </div>
  );
}
