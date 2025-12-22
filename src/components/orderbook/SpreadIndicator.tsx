// src/components/orderbook/SpreadIndicator.tsx

import { usePlaybackSnapshot } from "../../hooks/usePlaybackSnapshot";

export function SpreadIndicator() {
  const snapshot = usePlaybackSnapshot();

  if (!snapshot || snapshot.asks.length === 0 || snapshot.bids.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        Waiting for spread...
      </div>
    );
  }

  const bestAsk = snapshot.asks[0].price;
  const bestBid = snapshot.bids[0].price;

  const spread = bestAsk - bestBid;
  const mid = (bestAsk + bestBid) / 2;

  return (
    <div className="p-2 rounded bg-black/50 border border-gray-700 text-sm text-white mb-2 w-full max-w-xl mx-auto">
      <div className="flex justify-between">
        <div>Best Bid:</div>
        <div className="font-mono text-green-400">{bestBid.toFixed(1)}</div>
      </div>
      <div className="flex justify-between">
        <div>Best Ask:</div>
        <div className="font-mono text-red-400">{bestAsk.toFixed(1)}</div>
      </div>
      <div className="flex justify-between mt-1 border-t border-gray-700 pt-1">
        <div>Spread:</div>
        <div className="font-mono">{spread.toFixed(1)}</div>
      </div>
      <div className="flex justify-between">
        <div>Mid Price:</div>
        <div className="font-mono">{mid.toFixed(1)}</div>
      </div>
    </div>
  );
}
