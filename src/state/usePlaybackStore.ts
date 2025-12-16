// TODO: Manage playback mode, cursor, and speed in a dedicated global store
import { create } from "zustand";

interface PlaybackState {
  mode: "live" | "playback";
  cursorTime: number | null;
  isPlaying: boolean;
  speed: number; // 1x, 2x, etc.
  highlightedPrice: number | null;
  highlightedEventTime: number | null;

  setMode: (mode: "live" | "playback") => void;
  setCursor: (ts: number | null) => void;
  setPlaying: (value: boolean) => void;
  setSpeed: (value: number) => void;
  setHighlightedPrice: (p: number | null) => void;
  setHighlightedEventTime: (ts: number | null) => void;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  mode: "live",
  cursorTime: null,
  isPlaying: false,
  speed: 1,
  highlightedPrice: null,
  highlightedEventTime: null,

  setMode: (mode) => set(() => ({ mode, ...(mode === "live" ? { highlightedEventTime: null, highlightedPrice: null } : {}) })),
  setCursor: (ts) => set({ cursorTime: ts }),
  setPlaying: (v) => set({ isPlaying: v }),
  setSpeed: (v) => set({ speed: v }),
  setHighlightedPrice: (p) => set({ highlightedPrice: p }),
  setHighlightedEventTime: (ts) => set({ highlightedEventTime: ts }),

  reset: () => set({
    mode: "live",
    cursorTime: null,
    isPlaying: false,
    speed: 1,
    highlightedPrice: null,
    highlightedEventTime: null,
  }),
}));
