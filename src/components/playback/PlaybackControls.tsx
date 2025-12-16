// src/components/playback/PlaybackControls.tsx

import { useState, useEffect } from "react";
import { globalSnapshotBuffer } from "../../core/playback/snapshotBuffer";
import { usePlaybackStore } from "../../state/usePlaybackStore";

export function PlaybackControls() {
  const mode = usePlaybackStore((s) => s.mode);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const speed = usePlaybackStore((s) => s.speed);
  const cursorTime = usePlaybackStore((s) => s.cursorTime);

  const setMode = usePlaybackStore((s) => s.setMode);
  const setCursor = usePlaybackStore((s) => s.setCursor);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const setSpeed = usePlaybackStore((s) => s.setSpeed);
  const resetPlayback = usePlaybackStore((s) => s.reset);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  const status = mode === "live" ? `LIVE @ ${currentTime}` : `PLAYBACK @ ${cursorTime ? new Date(cursorTime).toLocaleTimeString() : "N/A"}`;

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

  const handleTimeTravel = () => {
    setMode("playback");
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex items-center justify-between text-sm text-gray-300 shadow-lg">
      {/* Left: Mode Selection */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleBackToLive}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            mode === "live"
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:shadow-md"
          }`}
        >
          Live
        </button>
        <button
          onClick={handleTimeTravel}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            mode === "playback"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:shadow-md"
          }`}
        >
          Time Travel
        </button>
      </div>

      {/* Middle: Playback Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-xl transition-all duration-200 hover:shadow-md"
          title={isPlaying ? "Pause Playback" : "Start Playback"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-sm mr-2">Speed:</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                speed === s
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:shadow-md"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Right: Status */}
      <div className="playback-status">
        {status}
      </div>
    </div>
  );
}
