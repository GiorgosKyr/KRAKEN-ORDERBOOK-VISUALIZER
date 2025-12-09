// TODO: Use Zustand to store live orderbook snapshot and expose selectors for the UI
// src/state/useOrderbookStore.ts
import { create } from "zustand";
import { OrderBookSnapshot } from "../types/domain";

interface OrderbookState {
  snapshot: OrderBookSnapshot | null;
  isLoading: boolean;
  error: string | null;
  setSnapshot: (snapshot: OrderBookSnapshot) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

export const useOrderbookStore = create<OrderbookState>((set) => ({
  snapshot: null,
  isLoading: true,
  error: null,

  setSnapshot: (snapshot) =>
    set({
      snapshot,
      isLoading: false,
      error: null,
    }),

  setLoading: (value) =>
    set({
      isLoading: value,
    }),

  setError: (message) =>
    set({
      error: message,
      isLoading: false,
    }),

  reset: () =>
    set({
      snapshot: null,
      isLoading: true,
      error: null,
    }),
}));
