// TODO: Implement pure reducer functions to update orderbook snapshots from incremental updates
// src/core/orderbook/orderbookReducer.ts

import { OrderBookSnapshot, OrderBookLevel } from "../../types/domain";
import { KrakenOrderBookData } from "../../types/krakenRaw";

/**
 * Create or refresh a full snapshot from Kraken snapshot data (as/bs).
 */
export function applySnapshot(
  existing: OrderBookSnapshot | null,
  raw: KrakenOrderBookData
): OrderBookSnapshot {
  return {
    asks: raw.as ? normalizeAskLevels(raw.as) : existing?.asks ?? [],
    bids: raw.bs ? normalizeBidLevels(raw.bs) : existing?.bids ?? [],
    timestamp: Date.now(),
  };
}

/**
 * Apply incremental deltas (a/b) on top of an existing snapshot.
 */
export function applyDeltas(
  existing: OrderBookSnapshot,
  raw: KrakenOrderBookData,
  depth: number
): OrderBookSnapshot {
  let asks = existing.asks;
  let bids = existing.bids;

  if (raw.a) {
    asks = mergeDeltas(asks, raw.a, "ask");
  }

  if (raw.b) {
    bids = mergeDeltas(bids, raw.b, "bid");
  }

  // Enforce depth limit
  const limitedAsks = asks.slice(0, depth);
  const limitedBids = bids.slice(0, depth);

  return {
    asks: limitedAsks,
    bids: limitedBids,
    timestamp: Date.now(),
  };
}

/**
 * Convert raw [price, size, ts?] tuples into sorted OrderBookLevels (asks).
 */
function normalizeAskLevels(levels: [string, string, string?][]): OrderBookLevel[] {
  return levels
    .map(([price, size]) => ({
      price: parseFloat(price),
      size: parseFloat(size),
    }))
    .filter((l) => l.size > 0)
    .sort((a, b) => a.price - b.price); // lowest ask first
}

/**
 * Convert raw [price, size, ts?] tuples into sorted OrderBookLevels (bids).
 */
function normalizeBidLevels(levels: [string, string, string?][]): OrderBookLevel[] {
  return levels
    .map(([price, size]) => ({
      price: parseFloat(price),
      size: parseFloat(size),
    }))
    .filter((l) => l.size > 0)
    .sort((a, b) => b.price - a.price); // highest bid first
}

/**
 * Merge delta updates into existing levels.
 * size = 0 → remove level.
 * otherwise → insert or update.
 */
function mergeDeltas(
  existing: OrderBookLevel[],
  deltas: [string, string, string?][],
  side: "ask" | "bid"
): OrderBookLevel[] {
  const book = [...existing];

  for (const [priceStr, sizeStr] of deltas) {
    const price = parseFloat(priceStr);
    const size = parseFloat(sizeStr);

    const idx = book.findIndex((l) => l.price === price);

    if (size === 0) {
      // remove level
      if (idx !== -1) {
        book.splice(idx, 1);
      }
      continue;
    }

    if (idx !== -1) {
      // update existing level
      book[idx].size = size;
    } else {
      // insert new level
      book.push({ price, size });
    }
  }

  // Re-sort after applying deltas
  if (side === "ask") {
    return book.sort((a, b) => a.price - b.price);
  } else {
    return book.sort((a, b) => b.price - a.price);
  }
}
