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

export type LiquidityEventInput = Omit<LiquidityEvent, 'id'>;

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
): LiquidityEventInput[] {
  const askThreshold = opts?.askThreshold ?? 3;
  const bidThreshold = opts?.bidThreshold ?? 3;

  const events: LiquidityEventInput[] = [];

  if (!prev) {
    // On initial snapshot, detect existing walls as "created"
    for (const level of curr.asks) {
      if (level.size >= askThreshold) {
        events.push({
          timestamp: curr.timestamp,
          side: "ask",
          type: "wall_created",
          price: level.price,
          size: level.size,
          threshold: askThreshold,
        });
      }
    }
    for (const level of curr.bids) {
      if (level.size >= bidThreshold) {
        events.push({
          timestamp: curr.timestamp,
          side: "bid",
          type: "wall_created",
          price: level.price,
          size: level.size,
          threshold: bidThreshold,
        });
      }
    }
    return events;
  }

  const prevAskMap = buildLevelMap(prev.asks);
  const currAskMap = buildLevelMap(curr.asks);
  const prevBidMap = buildLevelMap(prev.bids);
  const currBidMap = buildLevelMap(curr.bids);

  const push = (
    side: LiquiditySide,
    type: LiquidityEventType,
    price: number,
    size: number,
    threshold: number
  ) => {
    events.push({
      timestamp: curr.timestamp,
      side,
      type,
      price,
      size,
      threshold,
    });
  };

  const askCreate = askThreshold;
  const askRemove = askThreshold * 0.8;

  const bidCreate = bidThreshold;
  const bidRemove = bidThreshold * 0.8;

  // === ASKS ===
  for (const [price, prevSize] of prevAskMap.entries()) {
    const currSize = currAskMap.get(price) ?? 0;

    const prevIsWall = prevSize >= askRemove;
    const currIsWallCreate = currSize >= askCreate;
    const currIsWallRemove = currSize < askRemove;

    if (!prevIsWall && currIsWallCreate) {
      // crossed above create threshold
      push("ask", "wall_created", price, currSize, askCreate);
    }
    if (prevIsWall && currIsWallRemove) {
      // dropped below remove threshold
      push("ask", "wall_removed", price, currSize, askRemove);
    }
  }

  // new ask levels that weren't in prev at all
  for (const [price, currSize] of currAskMap.entries()) {
    if (!prevAskMap.has(price) && currSize >= askCreate) {
      push("ask", "wall_created", price, currSize, askCreate);
    }
  }

  // === BIDS ===
  for (const [price, prevSize] of prevBidMap.entries()) {
    const currSize = currBidMap.get(price) ?? 0;

    const prevIsWall = prevSize >= bidRemove;
    const currIsWallCreate = currSize >= bidCreate;
    const currIsWallRemove = currSize < bidRemove;

    if (!prevIsWall && currIsWallCreate) {
      push("bid", "wall_created", price, currSize, bidCreate);
    }
    if (prevIsWall && currIsWallRemove) {
      push("bid", "wall_removed", price, currSize, bidRemove);
    }
  }

  // new bid levels
  for (const [price, currSize] of currBidMap.entries()) {
    if (!prevBidMap.has(price) && currSize >= bidCreate) {
      push("bid", "wall_created", price, currSize, bidCreate);
    }
  }


  return events;
}
