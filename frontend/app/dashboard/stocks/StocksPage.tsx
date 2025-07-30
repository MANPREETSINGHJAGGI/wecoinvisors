useEffect(() => {
  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/live-stock-data");
      const data = await res.json();

      // ✅ Validate: Ensure we always pass an array
      const safeStocks = Array.isArray(data) ? data : [];

      setStocks(safeStocks);
      setFilteredStocks(safeStocks);

      const uniqueSectors = [...new Set(safeStocks.map((s: Stock) => s.sector))].sort();
      setSectors(uniqueSectors);
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setStocks([]);
      setFilteredStocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    fetchStocks();
  }
}, [user]);
