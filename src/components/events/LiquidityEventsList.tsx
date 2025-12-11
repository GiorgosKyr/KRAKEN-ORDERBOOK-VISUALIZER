// TODO: Show recent liquidity events produced by core/events/liquidityEvents
// src/components/events/LiquidityEventsList.tsx

import { useEventsStore } from "../../state/useEventsStore";

export function LiquidityEventsList() {
  const events = useEventsStore((s) => s.events);

  if (!events.length) {
    return (
      <div className="border border-gray-800 rounded-lg bg-black/50 p-2 text-xs text-gray-500">
        No liquidity wall events detected yet.
      </div>
    );
  }

  return (
    <div className="border border-gray-800 rounded-lg bg-black/50 p-2 text-xs text-gray-200 max-h-40 overflow-auto">
      <div className="flex items-center justify-between mb-1 text-[11px] text-gray-400">
        <span className="font-semibold">Liquidity Events</span>
        <span>Latest {events.length > 20 ? 20 : events.length}</span>
      </div>
      <ul className="space-y-0.5">
        {events.slice(0, 20).map((ev) => (
          <li
            key={ev.id}
            className="flex justify-between gap-2 border-b border-gray-800/60 last:border-b-0 py-1"
            >
            <div className="flex flex-col">
                <span className={ev.side === "ask" ? "text-red-300" : "text-emerald-300"}>
                {ev.side.toUpperCase()} • {ev.type.replace("_", " ")}
                </span>
                <span className="text-[10px] text-gray-500">
                {new Date(ev.timestamp).toLocaleTimeString()} • thresh {ev.threshold}
                </span>
            </div>
            <div className="text-right font-mono text-[11px]">
                <div>Px {ev.price.toFixed(1)}</div>
                <div className="text-gray-400">Size {ev.size.toFixed(4)}</div>
            </div>
            </li>
        ))}
      </ul>
    </div>
  );
}
