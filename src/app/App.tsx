import { useEffect } from "react";
import { getKrakenWsService } from "../api/krakenWsService";
import { applySnapshot, applyDeltas } from "../core/orderbook/orderbookReducer";
import { KrakenOrderBookData } from "../types/krakenRaw";
import { DEFAULT_DEPTH } from "../config/krakenConfig";
import { useOrderbookStore } from "../state/useOrderbookStore";
import { OrderbookTable } from "../components/orderbook/OrderbookTable";
import { SpreadIndicator } from "../components/orderbook/SpreadIndicator";
import { globalSnapshotBuffer } from "../core/playback/snapshotBuffer";
import { usePlaybackSnapshot } from "../hooks/usePlaybackSnapshot";
import { TimelineSlider } from "../components/playback/TimelineSlider";
import { PlaybackControls } from "../components/playback/PlaybackControls";
import { usePlaybackStore } from "../state/usePlaybackStore";


function App() {
  const snapshot = usePlaybackSnapshot();
  const setSnapshot = useOrderbookStore((s) => s.setSnapshot);
  const reset = useOrderbookStore((s) => s.reset);

  // // DEBUG: log whenever the snapshot in the store changes
  // useEffect(() => {
  //   if (snapshot) {
  //     console.log("STORE SNAPSHOT:", snapshot);
  //   }
  // }, [snapshot]);

  useEffect(() => {
    const service = getKrakenWsService();
    let currentSnapshot = null;

    // We need a non-hook way to read mode inside handlers
    const getPlaybackMode = () => usePlaybackStore.getState().mode;

    service.onMessage((msg: any) => {
      if (!Array.isArray(msg)) return;

      const [, payload, channel] = msg;
      if (channel !== "book-25") return;

      const book = payload as KrakenOrderBookData;

      // Snapshot (initial)
      if (book.as || book.bs) {
        currentSnapshot = applySnapshot(currentSnapshot, book);
        setSnapshot(currentSnapshot);

        // Only record history in LIVE mode
        if (getPlaybackMode() === "live") {
          globalSnapshotBuffer.add(currentSnapshot);
        }

        return;
      }

      // Delta (updates)
      if (currentSnapshot && (book.a || book.b)) {
        currentSnapshot = applyDeltas(currentSnapshot, book, DEFAULT_DEPTH);
        setSnapshot(currentSnapshot);

        if (getPlaybackMode() === "live") {
          globalSnapshotBuffer.add(currentSnapshot);
        }
      }

    //console.log("Buffer size:", globalSnapshotBuffer.getRange().length);

    });

    service.onOpen(() => {
      console.log("WS connected");
      service.subscribeOrderBook();
    });

    service.connect();
    reset();

    return () => service.disconnect();
  }, [setSnapshot, reset]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-black text-white">
      <PlaybackControls />
      <TimelineSlider />
      <SpreadIndicator />
      <OrderbookTable maxRows={15} />
    </div>
  );

}

export default App;
