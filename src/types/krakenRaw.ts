// TODO: Add TypeScript interfaces that match Kraken's raw WS orderbook and trade messages
// src/types/krakenRaw.ts

// Raw orderbook payload inside the channel message
export interface KrakenOrderBookData {
  // Snapshot fields
  as?: [string, string, string?][]; // asks snapshot: [price, volume, timestamp?]
  bs?: [string, string, string?][]; // bids snapshot

  // Delta fields
  a?: [string, string, string?][];  // ask deltas
  b?: [string, string, string?][];  // bid deltas
}

// Full channel message for orderbook updates:
// [channelId, data, channelName, pair]
export type KrakenOrderBookUpdate = [
  number,
  KrakenOrderBookData,
  string,
  string
];

export interface KrakenHeartbeat {
  event: "heartbeat";
}

// For now we keep this loose; we’ll narrow it as we handle more cases.
export type KrakenRawMessage = KrakenOrderBookUpdate | KrakenHeartbeat | any;
