// TODO: Implement a time-indexed buffer for storing and retrieving historical orderbook snapshots
// src/core/playback/snapshotBuffer.ts

import { OrderBookSnapshot } from "../../types/domain";

export interface SnapshotEntry {
  timestamp: number;
  snapshot: OrderBookSnapshot;
}

export class SnapshotBuffer {
  private buffer: SnapshotEntry[] = [];
  private maxSize: number;

  constructor(maxSize: number = 3000) { // stores ~3000 snapshots
    this.maxSize = maxSize;
  }

  add(snapshot: OrderBookSnapshot) {
    this.buffer.push({
      timestamp: snapshot.timestamp,
      snapshot,
    });

    if (this.buffer.length > this.maxSize) {
      this.buffer.shift(); // drop oldest
    }
  }

  getNearest(timestamp: number): SnapshotEntry | null {
    if (this.buffer.length === 0) return null;

    // binary search for performance
    let left = 0;
    let right = this.buffer.length - 1;

    while (left <= right) {
      const mid = (left + right) >> 1;
      const entry = this.buffer[mid];

      if (entry.timestamp === timestamp) return entry;

      if (entry.timestamp < timestamp) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // nearest older entry
    return this.buffer[right] || null;
  }

  getRange() {
    return this.buffer;
  }

  clear() {
    this.buffer = [];
  }
}

// global instance for now
export const globalSnapshotBuffer = new SnapshotBuffer(1800); 
// ~1800 snapshots = 30 seconds @ 60fps, or ~3 min if snapshots come slower
