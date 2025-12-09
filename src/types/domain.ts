// TODO: Define normalized domain types decoupled from Kraken's raw message shapes
// src/types/domain.ts

// One price level in the orderbook
export interface OrderBookLevel {
  price: number;  // e.g. 43210.5
  size: number;   // total quantity at that price
}

// A full snapshot of one side of the book
export type OrderBookSide = OrderBookLevel[];

// Full orderbook snapshot used by the app
export interface OrderBookSnapshot {
  bids: OrderBookSide;      // sorted descending by price
  asks: OrderBookSide;      // sorted ascending by price
  timestamp: number;        // ms since epoch when snapshot was produced
}
