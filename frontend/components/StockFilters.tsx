'use client';

import { useEffect, useState } from 'react';

interface Props {
  onFilter: (filters: {
    search: string;
    sector: string;
    sort: string;
    watchlistOnly: boolean;
  }) => void;
  sectors: string[];
}

export default function StockFilters({ onFilter, sectors }: Props) {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [sort, setSort] = useState('');
  const [watchlistOnly, setWatchlistOnly] = useState(false);

  useEffect(() => {
    onFilter({ search, sector, sort, watchlistOnly });
  }, [search, sector, sort, watchlistOnly]);

  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="🔍 Search by symbol or name"
        className="px-3 py-2 border border-gold rounded w-60 text-wecoin-blue bg-black/70"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 📊 Sector Filter */}
      <select
        className="px-3 py-2 border border-gold rounded bg-black/70 text-wecoin-blue"
        value={sector}
        onChange={(e) => setSector(e.target.value)}
      >
        <option value="">📊 All Sectors</option>
        {sectors.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* ⬇️ Sort */}
      <select
        className="px-3 py-2 border border-gold rounded bg-black/70 text-wecoin-blue"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="">⬇️ Sort</option>
        <option value="current_price">Price</option>
        <option value="pe_ratio">PE Ratio</option>
        <option value="change_pct">% Change</option>
        <option value="market_cap">Market Cap</option>
      </select>

      {/* ⭐ Watchlist */}
      <label className="flex items-center gap-2 text-wecoin-blue">
        <input
          type="checkbox"
          checked={watchlistOnly}
          onChange={(e) => setWatchlistOnly(e.target.checked)}
        />
        ⭐ Watchlist Only
      </label>
    </div>
  );
}
