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
      <input
        type="text"
        placeholder="🔍 Search by symbol or name"
        className="border p-2 rounded w-60"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="border p-2 rounded"
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

      <select
        className="border p-2 rounded"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="">⬇️ Sort</option>
        <option value="price">Price</option>
        <option value="pe">PE Ratio</option>
        <option value="change">% Change</option>
        <option value="marketcap">Market Cap</option>
      </select>

      <label className="flex items-center gap-2">
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
