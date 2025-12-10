// TODO: Manage playback mode, cursor, and speed in a dedicated global store
import { create } from "zustand";

interface PlaybackState {
  mode: "live" | "playback";
  cursorTime: number | null;
  isPlaying: boolean;
  speed: number; // 1x, 2x, etc.

  setMode: (mode: "live" | "playback") => void;
  setCursor: (ts: number | null) => void;
  setPlaying: (value: boolean) => void;
  setSpeed: (value: number) => void;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  mode: "live",
  cursorTime: null,
  isPlaying: false,
  speed: 1,

  setMode: (mode) => set({ mode }),
  setCursor: (ts) => set({ cursorTime: ts }),
  setPlaying: (v) => set({ isPlaying: v }),
  setSpeed: (v) => set({ speed: v }),

  reset: () => set({
    mode: "live",
    cursorTime: null,
    isPlaying: false,
    speed: 1,
  }),
}));
