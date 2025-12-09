// TODO: Wrap wsClient to handle Kraken-specific subscription/unsubscription messages
// src/api/krakenWsService.ts

import { KRAKEN_WS_URL, DEFAULT_PAIR, DEFAULT_DEPTH } from "../config/krakenConfig";
import { WsClient } from "./wsClient";

export class KrakenWsService {
  private client: WsClient;

  constructor() {
    this.client = new WsClient(KRAKEN_WS_URL);
  }

  connect() {
    this.client.connect();
  }

  disconnect() {
    this.client.disconnect();
  }

  onMessage(handler: (data: any) => void) {
    this.client.onMessage(handler);
  }

  onOpen(handler: () => void) {
    this.client.onOpen(handler);
  }

  subscribeOrderBook(pair: string = DEFAULT_PAIR, depth: number = DEFAULT_DEPTH) {
    const payload = {
      event: "subscribe",
      pair: [pair],
      subscription: {
        name: "book",
        depth,
      },
    };

    this.client.send(payload);
  }

  subscribeTrades(pair: string = DEFAULT_PAIR) {
    const payload = {
      event: "subscribe",
      pair: [pair],
      subscription: {
        name: "trade",
      },
    };

    this.client.send(payload);
  }
}

let singleton: KrakenWsService | null = null;

export function getKrakenWsService(): KrakenWsService {
  if (!singleton) {
    singleton = new KrakenWsService();
  }
  return singleton;
}
