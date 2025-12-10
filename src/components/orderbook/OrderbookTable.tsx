// TODO: Render top N bids and asks with price, size, and cumulative size
// src/components/orderbook/OrderbookTable.tsx

import { useOrderbookStore } from "../../state/useOrderbookStore";
import { OrderBookLevel } from "../../types/domain";

interface OrderbookTableProps {
  maxRows?: number;
}

export function OrderbookTable({ maxRows = 15 }: OrderbookTableProps) {
  const snapshot = useOrderbookStore((s) => s.snapshot);

  if (!snapshot) {
    return (
      <div className="text-sm text-gray-500">
        Waiting for orderbook snapshot...
      </div>
    );
  }

  const { bids, asks } = snapshot;

  const topBids = bids.slice(0, maxRows);
  const topAsks = asks.slice(0, maxRows);

  const renderRow = (level: OrderBookLevel, side: "bid" | "ask", index: number) => (
    <tr key={`${side}-${level.price}-${index}`}>
      <td className="px-2 py-0.5 text-xs text-gray-500">{side.toUpperCase()}</td>
      <td className="px-2 py-0.5 text-xs font-mono">
        {level.price.toFixed(1)}
      </td>
      <td className="px-2 py-0.5 text-xs font-mono">
        {level.size.toFixed(6)}
      </td>
    </tr>
  );

  return (
    <div className="border border-gray-700 rounded-md p-2 bg-black/40 text-white">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold">Orderbook (Top {maxRows})</h2>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-700 text-[11px] text-gray-400">
            <th className="px-2 py-1 text-left">Side</th>
            <th className="px-2 py-1 text-right">Price</th>
            <th className="px-2 py-1 text-right">Size</th>
          </tr>
        </thead>
        <tbody>
          {/* Asks first (from lowest ask upwards) */}
          {topAsks.map((l, i) => renderRow(l, "ask", i))}

          {/* Spacer row */}
          <tr>
            <td colSpan={3} className="py-1" />
          </tr>

          {/* Bids */}
          {topBids.map((l, i) => renderRow(l, "bid", i))}
        </tbody>
      </table>
    </div>
  );
}
