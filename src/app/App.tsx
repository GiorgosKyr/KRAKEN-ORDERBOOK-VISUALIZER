// src/app/App.tsx
import { useEffect, useRef } from "react";
import { getKrakenWsService } from "../api/krakenWsService";
import { applySnapshot, applyDeltas } from "../core/orderbook/orderbookReducer";
import { OrderBookSnapshot } from "../types/domain";
import { KrakenOrderBookData } from "../types/krakenRaw";
import { DEFAULT_DEPTH } from "../config/krakenConfig";

function App() {
  const snapshotRef = useRef<OrderBookSnapshot | null>(null);

  useEffect(() => {
    const service = getKrakenWsService();

    service.onMessage((data: any) => {
      // Ignore heartbeat + non-array messages
      if (!Array.isArray(data)) {
        return;
      }

      const [, payload, channelName] = data;

      if (channelName !== "book-25") {
        return;
      }

      const bookData = payload as KrakenOrderBookData;

      // Snapshot (as/bs present)
      if (bookData.as || bookData.bs) {
        snapshotRef.current = applySnapshot(snapshotRef.current, bookData);
      }
      // Delta (a/b present)
      else if (snapshotRef.current && (bookData.a || bookData.b)) {
        snapshotRef.current = applyDeltas(snapshotRef.current, bookData, DEFAULT_DEPTH);
      }

      if (snapshotRef.current) {
        console.log("NORMALIZED SNAPSHOT:", snapshotRef.current);
      }
    });

    service.onOpen(() => {
      console.log("Kraken WS connected, subscribing...");
      service.subscribeOrderBook();
    });

    service.connect();

    return () => {
      service.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-xl font-bold mb-2">Kraken Depth Explorer (WS Test)</h1>
        <p>Open the console to see normalized orderbook snapshots.</p>
      </div>
    </div>
  );
}

export default App;
