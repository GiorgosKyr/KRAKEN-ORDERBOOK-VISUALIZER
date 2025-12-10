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
import { OrderbookHeatmap } from "../components/orderbook/OrderbookHeatmap";


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
    <div className="w-full max-w-5xl px-4 py-4 flex flex-col gap-4">
      <PlaybackControls />
      <TimelineSlider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <OrderbookHeatmap maxRows={20} />
        <div className="flex flex-col gap-2">
          <SpreadIndicator />
          <OrderbookTable maxRows={15} />
        </div>
      </div>
    </div>
  );

}

export default App;
