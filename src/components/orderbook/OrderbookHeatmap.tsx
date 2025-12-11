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

  const maxSize = Math.max(maxAskSize, maxBidSize);

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
    <div className="heatmap-container">
      {/* ASK SIDE */}
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "4px 0", color: "#cc0000", fontSize: "14px", fontWeight: "bold", fontFamily: "'JetBrains Mono', monospace" }}>Asks</h3>
        {asks.slice(0, 20).filter(lvl => lvl.size >= 0.0001).map((lvl, i) => {
          const pct = maxSize > 0 ? (lvl.size / maxSize) * 100 : 0;
          return (
            <div
              key={`ask-${lvl.price}-${i}`}
              className="heatmap-row"
              title={`Price: ${lvl.price.toFixed(2)}\nSize: ${lvl.size.toFixed(4)}`}
            >
              <div style={{ textAlign: "right", paddingRight: "8px", color: "#ff6b6b" }}>
                {lvl.price.toFixed(1)}
              </div>
              <div style={{ textAlign: "right", paddingRight: "8px", color: "#ffffff" }}>
                {lvl.size.toFixed(2)}
              </div>
              <div className="heatmap-bar-container">
                <div
                  className="heatmap-bar-ask"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* BID SIDE */}
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "4px 0", color: "#00aa00", fontSize: "14px", fontWeight: "bold", fontFamily: "'JetBrains Mono', monospace" }}>Bids</h3>
        {bids.slice(0, 20).filter(lvl => lvl.size >= 0.0001).map((lvl, i) => {
          const pct = maxSize > 0 ? (lvl.size / maxSize) * 100 : 0;
          return (
            <div
              key={`bid-${lvl.price}-${i}`}
              className="heatmap-row"
              title={`Price: ${lvl.price.toFixed(2)}\nSize: ${lvl.size.toFixed(4)}`}
            >
              <div style={{ textAlign: "right", paddingRight: "8px", color: "#4ade80" }}>
                {lvl.price.toFixed(1)}
              </div>
              <div style={{ textAlign: "right", paddingRight: "8px", color: "#ffffff" }}>
                {lvl.size.toFixed(2)}
              </div>
              <div className="heatmap-bar-container">
                <div
                  className="heatmap-bar-bid"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
