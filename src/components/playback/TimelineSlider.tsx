// src/components/playback/TimelineSlider.tsx

import { useEffect, useMemo, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Continuous timeline
  const hasRange = minTs != null && maxTs != null;
  const timeRange = hasRange ? (maxTs! - minTs!) : 0;
  const scale = 0.1; // pixels per ms, adjust for visibility
  const timelineWidth = timeRange * scale;

  const timePoints = useMemo(() => {
    if (!minTs || !maxTs) return [];
    const points = [];
    const step = 5000; // 5 seconds
    for (let t = minTs; t <= maxTs; t += step) {
      points.push(t);
    }
    if (points[points.length - 1] !== maxTs) points.push(maxTs);
    return points;
  }, [minTs, maxTs]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (!hasRange) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const pct = clickX / timelineWidth;
    const ts = minTs! + pct * timeRange;
    const clampedTs = Math.min(Math.max(ts, minTs!), maxTs!);

    if (mode !== "playback") {
      setMode("playback");
    }
    setCursor(clampedTs);
    // Scroll the timeline so the chosen time is centered under the fixed scrubber
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const pos = ((clampedTs - minTs!) / timeRange) * timelineWidth;
      const target = Math.max(0, pos - container.clientWidth / 2);
      container.scrollTo({ left: target, behavior: 'smooth' });
    });
  };

  // currentPosition was used for an inline moving marker; we now use a fixed overlay scrubber and auto-scroll

  const handleBackToLive = () => {
    resetPlayback(); // mode: "live", cursorTime: null, etc.
  };

  // Keep the fixed scrubber centered during playback when cursorTime changes
  useEffect(() => {
    if (!containerRef.current) return;
    if (!hasRange) return;
    if (mode !== "playback") return;
    if (!cursorTime) return;
    const container = containerRef.current;
    const pos = ((cursorTime - minTs!) / timeRange) * timelineWidth;
    const leftEdge = container.scrollLeft + 40;
    const rightEdge = container.scrollLeft + container.clientWidth - 40;
    if (pos < leftEdge || pos > rightEdge) {
      const target = Math.max(0, pos - container.clientWidth / 2);
      container.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, [cursorTime, mode, hasRange, timelineWidth, timeRange, minTs]);

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
      <div
        ref={containerRef}
        className="timeline-scroll"
        style={{
          position: "relative",
          width: "100%",
          height: "96px",
          overflowX: "auto",
          overflowY: "hidden",
          border: "1px solid #374151",
          borderRadius: "6px",
          background: "#0f1724",
          cursor: "crosshair",
          padding: "8px 0 18px"
        }}
        onClick={handleTimelineClick}
      >
        <style>{`
          .timeline-scroll::-webkit-scrollbar { height: 8px; }
          .timeline-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
          .timeline-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 6px; }
          .timeline-scroll { scrollbar-width: thin; }
        `}</style>

        <div style={{ position: "relative", width: `${timelineWidth}px`, height: "100%", minHeight: 56 }}>
              {/* Timeline line */}
              <div style={{
                position: "absolute",
                top: "18px",
                left: 8,
                right: 8,
                height: "4px",
                background: "linear-gradient(90deg, rgba(107,114,128,0.12), rgba(107,114,128,0.06))",
                borderRadius: "4px"
              }} />

              {/* Current position marker removed from inner content; using fixed overlay scrubber below */}

              {/* Time labels (below the line, above the scrollbar area) */}
              {timePoints.map((ts) => {
                const pct = ((ts - minTs!) / timeRange) * 100;
                return (
                  <div
                    key={ts}
                    style={{
                      position: "absolute",
                      top: "40px",
                      left: `calc(${pct}% )`,
                      transform: "translateX(-50%)",
                      fontSize: "11px",
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 10
                    }}
                  >
                    {formatTime(ts)}
                  </div>
                );
              })}

              {/* Event marker */}
              {highlightedEventTime && minTs && maxTs && (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    left: `calc(${((highlightedEventTime - minTs) / timeRange) * 100}% )`,
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                    zIndex: 25
                  }}
                >
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 0C10.3137 0 13 2.68629 13 6C13 10.5 7 18 7 18C7 18 1 10.5 1 6C1 2.68629 3.68629 0 7 0Z" fill="#ef4444" stroke="#0f172a" strokeWidth="1"/>
                    <circle cx="7" cy="5.2" r="1.6" fill="#fff" opacity="0.18" />
                  </svg>
                </div>
              )}
            {/* moving current position marker inside the timeline */}
            {cursorTime && hasRange && (
              (() => {
                const pct = ((cursorTime - minTs!) / timeRange) * 100;
                return (
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: `calc(${pct}% )`,
                    width: '14px',
                    height: '14px',
                    background: '#fbbf24',
                    borderRadius: '50%',
                    transform: 'translateX(-50%)',
                    border: '2px solid #0f172a',
                    zIndex: 20,
                    boxShadow: '0 4px 12px rgba(251,191,36,0.25)'
                  }} />
                );
              })()
            )}
          </div>
        </div>

        {/* Overlay labels (always visible) */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 18, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: 10, bottom: 6, fontSize: 11, color: '#9ca3af' }}>{hasRange ? formatTime(minTs!) : ''}</div>
          <div style={{ position: 'absolute', right: 10, bottom: 6, fontSize: 11, color: '#9ca3af' }}>{hasRange ? formatTime(maxTs!) : ''}</div>
          <div style={{ position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)', fontSize: 11, color: '#9ca3af' }}>{hasRange ? `${Math.round(timeRange / 1000)}s` : ''}</div>
        </div>
      </div>
  );
}

