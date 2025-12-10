import type { OrderBookSnapshot, OrderBookLevel } from "../../types/domain";

export type LiquiditySide = "bid" | "ask";
export type LiquidityEventType = "wall_created" | "wall_removed";

export interface LiquidityEvent {
  id: string;
  timestamp: number;
  side: LiquiditySide;
  type: LiquidityEventType;
  price: number;
  size: number;
  threshold: number;
}

function buildLevelMap(levels: OrderBookLevel[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const lvl of levels) {
    map.set(lvl.price, lvl.size);
  }
  return map;
}

export function detectLiquidityWalls(
  prev: OrderBookSnapshot | null,
  curr: OrderBookSnapshot,
  opts?: { askThreshold?: number; bidThreshold?: number }
): LiquidityEvent[] {
  if (!prev) return [];

  const askThreshold = opts?.askThreshold ?? 3;
  const bidThreshold = opts?.bidThreshold ?? 3;

  const prevAskMap = buildLevelMap(prev.asks);
  const currAskMap = buildLevelMap(curr.asks);
  const prevBidMap = buildLevelMap(prev.bids);
  const currBidMap = buildLevelMap(curr.bids);

  const events: LiquidityEvent[] = [];

  const push = (
    side: LiquiditySide,
    type: LiquidityEventType,
    price: number,
    size: number,
    threshold: number
  ) => {
    events.push({
      id: `${curr.timestamp}-${side}-${type}-${price.toFixed(1)}`,
      timestamp: curr.timestamp,
      side,
      type,
      price,
      size,
      threshold,
    });
  };

  // ASKS
  for (const [price, prevSize] of prevAskMap.entries()) {
    const currSize = currAskMap.get(price) ?? 0;
    const prevIsWall = prevSize >= askThreshold;
    const currIsWall = currSize >= askThreshold;

    if (!prevIsWall && currIsWall) {
      push("ask", "wall_created", price, currSize, askThreshold);
    } else if (prevIsWall && !currIsWall) {
      push("ask", "wall_removed", price, prevSize, askThreshold);
    }
  }

  for (const [price, currSize] of currAskMap.entries()) {
    if (!prevAskMap.has(price) && currSize >= askThreshold) {
      push("ask", "wall_created", price, currSize, askThreshold);
    }
  }

  // BIDS
  for (const [price, prevSize] of prevBidMap.entries()) {
    const currSize = currBidMap.get(price) ?? 0;
    const prevIsWall = prevSize >= bidThreshold;
    const currIsWall = currSize >= bidThreshold;

    if (!prevIsWall && currIsWall) {
      push("bid", "wall_created", price, currSize, bidThreshold);
    } else if (prevIsWall && !currIsWall) {
      push("bid", "wall_removed", price, prevSize, bidThreshold);
    }
  }

  for (const [price, currSize] of currBidMap.entries()) {
    if (!prevBidMap.has(price) && currSize >= bidThreshold) {
      push("bid", "wall_created", price, currSize, bidThreshold);
    }
  }

  return events;
}
