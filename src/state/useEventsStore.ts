// src/state/useEventsStore.ts
import { create } from "zustand";
import type { LiquidityEvent } from "../core/events/liquidityEvents";

type LiquidityEventInput = Omit<LiquidityEvent, "id">;

interface EventsState {
  events: LiquidityEvent[];
  eventCounter: number;
  addEvents: (newEvents: LiquidityEventInput[]) => void;
  clear: () => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  eventCounter: 0,

  addEvents: (newEvents) =>
    set((state) => {
      const baseCounter = state.eventCounter;

      const lastExisting = state.events[0]; // most recent in current list

      // filter out consecutive duplicates (same logical event)
      const filtered: LiquidityEventInput[] = [];
      for (const ev of newEvents) {
        const last =
          filtered.length > 0 ? filtered[filtered.length - 1] : lastExisting;

        const isSameLogical =
          last &&
          last.side === ev.side &&
          last.type === ev.type &&
          last.price === ev.price &&
          Number(last.size.toFixed(6)) === Number(ev.size.toFixed(6));

        if (!isSameLogical) {
          filtered.push(ev);
        }
      }

      if (filtered.length === 0) {
        return state;
      }

      const withIds: LiquidityEvent[] = filtered.map((event, idx) => ({
        ...event,
        id: `${event.timestamp}-${event.side}-${event.type}-${event.price.toFixed(
          2
        )}-${baseCounter + idx}`,
      }));

      const nextCounter = baseCounter + filtered.length;

      return {
        events: [...withIds, ...state.events].slice(0, 50),
        eventCounter: nextCounter,
      };
    }),

  clear: () => set({ events: [], eventCounter: 0 }),
}));
