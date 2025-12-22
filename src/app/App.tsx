import { useEffect, useState } from "react";
import { getKrakenWsService } from "../api/krakenWsService";
import { applySnapshot, applyDeltas } from "../core/orderbook/orderbookReducer";
import { KrakenOrderBookData } from "../types/krakenRaw";
import { OrderBookSnapshot } from "../types/domain";
import { DEFAULT_DEPTH } from "../config/krakenConfig";
import { useOrderbookStore } from "../state/useOrderbookStore";
import { OrderbookHeatmap } from "../components/orderbook/OrderbookHeatmap";
import { SpreadIndicator } from "../components/orderbook/SpreadIndicator";
import { globalSnapshotBuffer } from "../core/playback/snapshotBuffer";
import { detectLiquidityWalls } from "../core/events/liquidityEvents";
import { useEventsStore } from "../state/useEventsStore";
import { TimelineSlider } from "../components/playback/TimelineSlider";
import { PlaybackControls } from "../components/playback/PlaybackControls";
import { usePlaybackStore } from "../state/usePlaybackStore";
import { LiquidityEventsList } from "../components/events/LiquidityEventsList";


function App() {
  const setSnapshot = useOrderbookStore((s) => s.setSnapshot);
  const reset = useOrderbookStore((s) => s.reset);
  const [rows, setRows] = useState<number>(10);
  const addEvents = useEventsStore.getState().addEvents;

  // // DEBUG: log whenever the snapshot in the store changes
  // useEffect(() => {
  //   if (snapshot) {
  //     console.log("STORE SNAPSHOT:", snapshot);
  //   }
  // }, [snapshot]);

  useEffect(() => {
    const service = getKrakenWsService();
    let currentSnapshot: OrderBookSnapshot | null = null;
    // throttle history recording to avoid filling the buffer too quickly
    let lastSnapshotAdd = 0;

    // We need a non-hook way to read mode inside handlers
    const getPlaybackMode = () => usePlaybackStore.getState().mode;

    service.onMessage((msg: any) => {
      if (!Array.isArray(msg)) return;

      const [, payload, channel] = msg;
      if (channel !== "book-25") return;

      const book = payload as KrakenOrderBookData;

      // Snapshot (initial)
      if (book.as || book.bs) {
        const prevSnapshot = currentSnapshot;
        currentSnapshot = applySnapshot(currentSnapshot, book);
        setSnapshot(currentSnapshot);

        // Only record history in LIVE mode
        if (getPlaybackMode() === "live") {
          const now = Date.now();
          if (now - lastSnapshotAdd >= 200) { // add at most 5x per second
            globalSnapshotBuffer.add(currentSnapshot);
            lastSnapshotAdd = now;
          }
        }

        // detect liquidity walls and add events
        try {
          const { askThreshold, bidThreshold } = useEventsStore.getState();
          const evs = detectLiquidityWalls(prevSnapshot, currentSnapshot, { askThreshold, bidThreshold });
          if (evs && evs.length) addEvents(evs);
        } catch (err) {
          console.error("detectLiquidityWalls error:", err);
        }

        return;
      }

      // Delta (updates)
      if (currentSnapshot && (book.a || book.b)) {
        const prevSnapshot = currentSnapshot;
        currentSnapshot = applyDeltas(currentSnapshot, book, DEFAULT_DEPTH);
        setSnapshot(currentSnapshot);

        if (getPlaybackMode() === "live") {
          const now = Date.now();
          if (now - lastSnapshotAdd >= 200) { // add at most 5x per second
            globalSnapshotBuffer.add(currentSnapshot);
            lastSnapshotAdd = now;
          }
        }

        // detect liquidity walls and add events
        try {
          const { askThreshold, bidThreshold } = useEventsStore.getState();
          const evs = detectLiquidityWalls(prevSnapshot, currentSnapshot, { askThreshold, bidThreshold });
          if (evs && evs.length) addEvents(evs);
        } catch (err) {
          console.error("detectLiquidityWalls error:", err);
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black text-white">
 
      <div className="w-full max-w-3xl flex justify-center">
        <div className="flex items-center gap-4 mb-3 w-full justify-center">
          <label className="text-sm text-gray-400 mr-2">Rows</label>
          <div className="flex items-center gap-3 w-1/2">
            <input
              type="range"
              min={5}
              max={25}
              step={1}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="rows-slider w-full"
            />
            <div className="text-sm text-gray-300 w-10 text-right font-mono">{rows}</div>
          </div>

          
        </div>
      </div>

      <OrderbookHeatmap maxRows={rows} />
      
    
      <div className="w-full max-w-3xl">
        <PlaybackControls />
        <TimelineSlider />
      </div>     

      <div className="w-full max-w-3xl flex flex-col gap-2">
        <SpreadIndicator />
      </div>
      <div className="text-xs text-gray-600 mt-4 mb-2">
        <LiquidityEventsList />
      </div>
    </div>
  );

}

export default App;
