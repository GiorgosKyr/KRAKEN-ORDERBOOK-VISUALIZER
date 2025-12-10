// src/components/orderbook/OrderbookHeatmap.tsx

import { usePlaybackSnapshot } from "../../hooks/usePlaybackSnapshot";
import type { OrderBookLevel } from "../../types/domain";

interface OrderbookHeatmapProps {
  maxRows?: number;
}

function normalizeLevels(levels: OrderBookLevel[], maxRows: number) {
  const slice = levels.slice(0, maxRows);
  const maxSize = slice.reduce((acc, l) => (l.size > acc ? l.size : acc), 0);
  return {
    slice,
    maxSize,
  };
}

export function OrderbookHeatmap({ maxRows = 20 }: OrderbookHeatmapProps) {
  const snapshot = usePlaybackSnapshot();

  if (!snapshot) {
    return (
      <div className="text-sm text-gray-500">
        Waiting for orderbook snapshot...
      </div>
    );
  }

  const { bids, asks } = snapshot;

  const { slice: topAsks, maxSize: maxAskSize } = normalizeLevels(asks, maxRows);
  const { slice: topBids, maxSize: maxBidSize } = normalizeLevels(bids, maxRows);

  const renderAskRow = (level: OrderBookLevel, index: number) => {
    const fraction = maxAskSize > 0 ? level.size / maxAskSize : 0;
    const widthPct = Math.max(fraction * 100, 5); // at least 5% visible

    return (
      <div
        key={`ask-${level.price}-${index}`}
        className="grid grid-cols-[auto,1fr,auto] items-center gap-2 py-0.5 text-xs font-mono"
      >
        {/* Price */}
        <span className="text-gray-400">{level.price.toFixed(1)}</span>

        {/* Bar */}
        <div
          className="w-full h-3 rounded-sm overflow-hidden"
          style={{ backgroundColor: "rgba(127,29,29,0.15)" }} // faint background
        >
          <div
            className="h-full transition-all duration-150 flex items-center justify-center text-white text-xs"
            style={{
              width: `${widthPct}%`,
              backgroundColor: "red",
            }}
          >
            {widthPct.toFixed(0)}%
          </div>
        </div>

        {/* Size */}
        <span className="text-gray-200 text-right">
          {level.size.toFixed(4)}
        </span>
      </div>
    );
  };

  const renderBidRow = (level: OrderBookLevel, index: number) => {
    const fraction = maxBidSize > 0 ? level.size / maxBidSize : 0;
    const widthPct = Math.max(fraction * 100, 5); // at least 5%

    return (
      <div
        key={`bid-${level.price}-${index}`}
        className="grid grid-cols-[auto,1fr,auto] items-center gap-2 py-0.5 text-xs font-mono"
      >
        {/* Size */}
        <span className="text-gray-200">
          {level.size.toFixed(4)}
        </span>

        {/* Bar */}
        <div
          className="w-full h-3 rounded-sm overflow-hidden"
          style={{ backgroundColor: "rgba(6,78,59,0.15)" }} // faint background
        >
          <div
            className="h-full transition-all duration-150 flex items-center justify-center text-white text-xs"
            style={{
              width: `${widthPct}%`,
              backgroundColor: "green",
            }}
          >
            {widthPct.toFixed(0)}%
          </div>
        </div>

        {/* Price */}
        <span className="text-gray-400 text-right">
          {level.price.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl border border-gray-800 rounded-lg bg-black/60 p-3 text-white">
      <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
        <span className="font-semibold text-sm">Orderbook Heatmap</span>
        <span>
          Levels shown: {Math.min(maxRows, asks.length)}/{asks.length} asks •{" "}
          {Math.min(maxRows, bids.length)}/{bids.length} bids
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Asks panel */}
        <div>
          <div className="flex items-center justify-between mb-1 text-[11px] text-red-300">
            <span>ASKS (sellers)</span>
            <span>Price / Size</span>
          </div>
          <div className="border border-gray-800 rounded-md px-2 py-1 max-h-64 overflow-hidden">
            {topAsks.length === 0 ? (
              <div className="text-xs text-gray-500 py-2">No asks available</div>
            ) : (
              topAsks.map(renderAskRow)
            )}
          </div>
        </div>

        {/* Bids panel */}
        <div>
          <div className="flex items-center justify-between mb-1 text-[11px] text-emerald-300">
            <span>Price / Size</span>
            <span>BIDS (buyers)</span>
          </div>
          <div className="border border-gray-800 rounded-md px-2 py-1 max-h-64 overflow-hidden">
            {topBids.length === 0 ? (
              <div className="text-xs text-gray-500 py-2">No bids available</div>
            ) : (
              topBids.map(renderBidRow)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
