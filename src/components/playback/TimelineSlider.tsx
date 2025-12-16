// src/components/playback/TimelineSlider.tsx

import { useEffect, useMemo, useState } from "react";
import { globalSnapshotBuffer } from "../../core/playback/snapshotBuffer";
import { usePlaybackStore } from "../../state/usePlaybackStore";

export function TimelineSlider() {
  const mode = usePlaybackStore((s) => s.mode);
  const cursorTime = usePlaybackStore((s) => s.cursorTime);
  const setMode = usePlaybackStore((s) => s.setMode);
  const setCursor = usePlaybackStore((s) => s.setCursor);
  const resetPlayback = usePlaybackStore((s) => s.reset);

  const [minTs, setMinTs] = useState<number | null>(null);
  const [maxTs, setMaxTs] = useState<number | null>(null);
  const highlightedEventTime = usePlaybackStore((s) => s.highlightedEventTime);

  // Only update min/max while in LIVE mode
  useEffect(() => {
    if (mode !== "live") return;

    const id = setInterval(() => {
      const range = globalSnapshotBuffer.getRange();
      if (!range.length) return;

      const first = range[0].timestamp;
      const last = range[range.length - 1].timestamp;

      setMinTs(first);
      setMaxTs(last);
    }, 500);

    return () => clearInterval(id);
  }, [mode]);

  const sliderValue = useMemo(() => {
    if (!minTs || !maxTs) return 0;

    if (cursorTime == null) {
      // In live mode with no cursor set, stick to the newest snapshot
      return maxTs;
    }

    // Clamp inside the frozen window
    return Math.min(Math.max(cursorTime, minTs), maxTs);
  }, [cursorTime, minTs, maxTs]);

  if (!minTs || !maxTs) {
    return (
      <div className="text-xs text-gray-500">
        Building history…
      </div>
    );
  }

  const renderEventMarker = () => {
    if (!highlightedEventTime || !minTs || !maxTs) return null;
    if (highlightedEventTime < minTs || highlightedEventTime > maxTs) return null;
    const pct = ((highlightedEventTime - minTs) / (maxTs - minTs)) * 100;

    return (
      <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%, -60%)", pointerEvents: "none", zIndex: 5 }}>
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 0C10.3137 0 13 2.68629 13 6C13 10.5 7 18 7 18C7 18 1 10.5 1 6C1 2.68629 3.68629 0 7 0Z" fill="#ef4444" stroke="#0f172a" strokeWidth="1"/>
          <circle cx="7" cy="5.2" r="1.6" fill="#fff" opacity="0.18" />
        </svg>
      </div>
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ts = Number(e.target.value);
    if (!Number.isFinite(ts)) return;

    // On first interaction, switch to playback and freeze the window
    if (mode !== "playback") {
      setMode("playback");
    }
    setCursor(ts);
  };

  const handleBackToLive = () => {
    resetPlayback(); // mode: "live", cursorTime: null, etc.
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-3" style={{ position: "relative" }}>
      <div className="flex items-center justify-between mb-1 text-xs text-gray-400">
        <span>
          Mode:{" "}
          <span className={mode === "live" ? "text-green-400" : "text-yellow-400"}>
            {mode.toUpperCase()}
          </span>
        </span>
        <button
          type="button"
          onClick={handleBackToLive}
          className="px-2 py-0.5 border border-gray-700 rounded text-[11px] hover:bg-gray-800"
        >
          Back to Live
        </button>
      </div>
      <div style={{ position: "relative", width: "100%" }}>
        {renderEventMarker()}
        <input
          type="range"
          min={minTs}
          max={maxTs}
          value={sliderValue}
          onChange={handleChange}
          className="timeline-slider w-full"
        />
      </div>
    </div>
  );
}
