// src/components/playback/PlaybackControls.tsx

import { globalSnapshotBuffer } from "../../core/playback/snapshotBuffer";
import { usePlaybackStore } from "../../state/usePlaybackStore";

export function PlaybackControls() {
  const mode = usePlaybackStore((s) => s.mode);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const speed = usePlaybackStore((s) => s.speed);

  const setMode = usePlaybackStore((s) => s.setMode);
  const setCursor = usePlaybackStore((s) => s.setCursor);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setSpeed = usePlaybackStore((s) => s.setSpeed);
  const resetPlayback = usePlaybackStore((s) => s.reset);

  const handlePlay = () => {
    const range = globalSnapshotBuffer.getRange();
    if (!range.length) return;

    // Switch to playback mode
    if (mode !== "playback") {
      setMode("playback");
    }

    // If no cursor set yet, start from earliest or latest snapshot
    if (usePlaybackStore.getState().cursorTime == null) {
      const last = range[range.length - 1].timestamp;
      setCursor(last);
    }

    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleBackToLive = () => {
    resetPlayback(); // mode: live, cursorTime: null, isPlaying: false, speed: 1
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-2 flex items-center justify-between text-xs text-gray-300">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isPlaying ? handlePause : handlePlay}
          className="px-2 py-0.5 border border-gray-700 rounded hover:bg-gray-800 text-[11px]"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          type="button"
          onClick={handleBackToLive}
          className="px-2 py-0.5 border border-gray-700 rounded hover:bg-gray-800 text-[11px]"
        >
          Live
        </button>

        <span className="ml-2">
          Mode:{" "}
          <span className={mode === "live" ? "text-green-400" : "text-yellow-400"}>
            {mode.toUpperCase()}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-gray-400">Speed:</span>
        {[0.5, 1, 2, 4].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSpeedChange(s)}
            className={`px-2 py-0.5 border border-gray-700 rounded text-[11px] ${
              speed === s ? "bg-gray-800 text-white" : "hover:bg-gray-800"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
