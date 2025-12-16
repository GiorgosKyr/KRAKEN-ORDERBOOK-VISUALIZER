// TODO: Show recent liquidity events produced by core/events/liquidityEvents
// src/components/events/LiquidityEventsList.tsx

import { useEventsStore } from "../../state/useEventsStore";
import { usePlaybackStore } from "../../state/usePlaybackStore";

export function LiquidityEventsList() {
  const events = useEventsStore((s) => s.events);
  const askThreshold = useEventsStore((s) => s.askThreshold);
  const bidThreshold = useEventsStore((s) => s.bidThreshold);
  const setAskThreshold = useEventsStore((s) => s.setAskThreshold);
  const setBidThreshold = useEventsStore((s) => s.setBidThreshold);

  if (!events.length) {
    return (
      <div className="border border-gray-800 rounded-lg bg-black/50 p-2 text-xs text-gray-500">
        <div className="flex items-center justify-between mb-2">
          <div>No liquidity wall events detected yet.</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-400">Ask</label>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={askThreshold}
                onChange={(e) => setAskThreshold(Number(e.target.value))}
                className="rows-slider w-28"
              />
              <div className="text-[11px] text-gray-300 w-6 text-right font-mono">{askThreshold}</div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-400">Bid</label>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={bidThreshold}
                onChange={(e) => setBidThreshold(Number(e.target.value))}
                className="rows-slider w-28"
              />
              <div className="text-[11px] text-gray-300 w-6 text-right font-mono">{bidThreshold}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-800 rounded-lg bg-black/50 p-2 text-xs text-gray-200 max-h-40 overflow-auto">
      <div className="flex items-center justify-between mb-1 text-[11px] text-gray-400">
        <span className="font-semibold">Liquidity Events</span>
        <span>Latest {events.length > 20 ? 20 : events.length}</span>
      </div>
      <div className="flex items-center justify-end gap-4 mb-2">
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-gray-400">Ask</label>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={askThreshold}
            onChange={(e) => setAskThreshold(Number(e.target.value))}
            className="rows-slider w-28"
          />
          <div className="text-[11px] text-gray-300 w-6 text-right font-mono">{askThreshold}</div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] text-gray-400">Bid</label>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={bidThreshold}
            onChange={(e) => setBidThreshold(Number(e.target.value))}
            className="rows-slider w-28"
          />
          <div className="text-[11px] text-gray-300 w-6 text-right font-mono">{bidThreshold}</div>
        </div>
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
            <div className="flex items-center">
              <JumpButton timestamp={ev.timestamp} price={ev.price} />
            </div>
            </li>
        ))}
      </ul>
    </div>
  );
}

function JumpButton({ timestamp, price }: { timestamp: number; price: number }) {
  const setMode = usePlaybackStore((s) => s.setMode);
  const setCursor = usePlaybackStore((s) => s.setCursor);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setHighlightedPrice = usePlaybackStore((s) => s.setHighlightedPrice);
  const setHighlightedEventTime = usePlaybackStore((s) => s.setHighlightedEventTime);

  const handleJump = () => {
    const PRELOAD_MS = 3000; // seek a few seconds before the event
    const target = Math.max(0, Math.floor(timestamp - PRELOAD_MS));
    setMode("playback");
    setCursor(target);
    setPlaying(false);
    setHighlightedPrice(price);
    // keep the pin at the actual event time so it shows where the event occurs
    setHighlightedEventTime(timestamp);
  };

  return (
    <button
      type="button"
      onClick={handleJump}
      className="ml-2 px-2 py-0.5 border border-gray-700 rounded text-[11px] hover:bg-gray-800"
      title="Jump to this event time"
    >
      Jump
    </button>
  );
}
