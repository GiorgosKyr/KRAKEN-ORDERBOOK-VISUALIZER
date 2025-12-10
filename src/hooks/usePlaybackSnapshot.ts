// src/hooks/usePlaybackSnapshot.ts
import { useEffect, useState } from "react";
import { useOrderbookStore } from "../state/useOrderbookStore";
import { usePlaybackStore } from "../state/usePlaybackStore";
import { globalSnapshotBuffer } from "../core/playback/snapshotBuffer";
import type { OrderBookSnapshot } from "../types/domain";

export function usePlaybackSnapshot(): OrderBookSnapshot | null {
  const liveSnapshot = useOrderbookStore((s) => s.snapshot);

  const mode = usePlaybackStore((s) => s.mode);
  const cursorTime = usePlaybackStore((s) => s.cursorTime);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const speed = usePlaybackStore((s) => s.speed);
  const setCursor = usePlaybackStore((s) => s.setCursor);

  const [playbackSnapshot, setPlaybackSnapshot] = useState<OrderBookSnapshot | null>(
    liveSnapshot
  );

  // Auto-advance cursor when playing in playback mode
  useEffect(() => {
    if (mode !== "playback" || !isPlaying) return;

    // If no cursor yet, start from latest snapshot
    let currentTs = cursorTime;
    if (currentTs == null) {
      const range = globalSnapshotBuffer.getRange();
      if (!range.length) return;
      currentTs = range[range.length - 1].timestamp;
      setCursor(currentTs);
    }

    if (currentTs == null) return;

    let ts = currentTs;

    const interval = setInterval(() => {
      const range = globalSnapshotBuffer.getRange();
      if (!range.length) return;

      const last = range[range.length - 1].timestamp;

      ts += 100 * speed;
      if (ts > last) ts = last;

      setCursor(ts);
    }, 100);

    return () => clearInterval(interval);
  }, [mode, isPlaying, cursorTime, speed, setCursor]);

  // Decide which snapshot to expose
  useEffect(() => {
    if (mode === "live") {
      setPlaybackSnapshot(liveSnapshot);
      return;
    }

    if (cursorTime == null) return;

    const entry = globalSnapshotBuffer.getNearest(cursorTime);
    if (entry) {
      setPlaybackSnapshot(entry.snapshot);
    }
  }, [mode, cursorTime, liveSnapshot]); // liveSnapshot needed for live mode updates

  return playbackSnapshot;
}
