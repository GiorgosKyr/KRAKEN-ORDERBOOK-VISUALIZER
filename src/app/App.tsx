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
import { detectLiquidityWalls } from "../core/events/liquidityEvents";
import { OrderBookSnapshot } from "../types/domain";
import { useEventsStore } from "../state/useEventsStore";
import { LiquidityEventsList } from "../components/events/LiquidityEventsList";


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
    const addEvents = useEventsStore.getState().addEvents;

    let currentSnapshot: OrderBookSnapshot | null = null;

    const getPlaybackMode = () => usePlaybackStore.getState().mode;

    service.onMessage((msg: any) => {
      if (!Array.isArray(msg)) return;

      const [, payload, channel] = msg;
      if (channel !== "book-25") return;

      const book = payload as KrakenOrderBookData;

      // Helper: deep clone previous snapshot
      const clonePrev = (): OrderBookSnapshot | null =>
        currentSnapshot ? JSON.parse(JSON.stringify(currentSnapshot)) : null;

      // === Snapshot (initial/full) ===
      if (book.as || book.bs) {
        const prevSnapshot = clonePrev();

        currentSnapshot = applySnapshot(currentSnapshot, book);
        setSnapshot(currentSnapshot);

        if (getPlaybackMode() === "live" && currentSnapshot) {
          globalSnapshotBuffer.add(currentSnapshot);
        }

        if (prevSnapshot && currentSnapshot) {
          const events = detectLiquidityWalls(prevSnapshot, currentSnapshot, {
            askThreshold: 8,
            bidThreshold: 8,
          });
          if (events.length) {
            console.log("Liquidity events:", events);
            addEvents(events);
          }
        }

        return;
      }

      // === Delta (incremental) ===
      if (currentSnapshot && (book.a || book.b)) {
        const prevSnapshot = clonePrev();

        currentSnapshot = applyDeltas(currentSnapshot, book, DEFAULT_DEPTH);
        setSnapshot(currentSnapshot);

        if (getPlaybackMode() === "live" && currentSnapshot) {
          globalSnapshotBuffer.add(currentSnapshot);
        }

        if (prevSnapshot && currentSnapshot) {
          const events = detectLiquidityWalls(prevSnapshot, currentSnapshot, {
            askThreshold: 8,
            bidThreshold: 8,
          });
          if (events.length) {
            console.log("Liquidity events:", events);
            addEvents(events);
          }
        }
      }
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2">
          <OrderbookHeatmap maxRows={20} />
        </div>
        <div className="flex flex-col gap-2">
          <SpreadIndicator />
          {/* <OrderbookTable maxRows={15} /> */}
          <LiquidityEventsList />
        </div>
      </div>
    </div>
  );

}

export default App;
