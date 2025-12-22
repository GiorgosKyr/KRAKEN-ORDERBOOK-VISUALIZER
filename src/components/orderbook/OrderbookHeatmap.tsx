// src/components/orderbook/OrderbookHeatmap.tsx

import { useEffect, useRef } from "react";
import { usePlaybackSnapshot } from "../../hooks/usePlaybackSnapshot";
import { usePlaybackStore } from "../../state/usePlaybackStore";
import type { OrderBookLevel } from "../../types/domain";

interface OrderbookHeatmapProps {
  maxRows?: number;
}

function normalizeLevels(levels: OrderBookLevel[]) {
  const maxSize = levels.reduce((acc, l) => (l.size > acc ? l.size : acc), 0);
  return { maxSize };
}

export function OrderbookHeatmap({ maxRows = 50 }: OrderbookHeatmapProps) {
  const snapshot = usePlaybackSnapshot();
  const highlightedPrice = usePlaybackStore((s) => s.highlightedPrice);
  const askRef = useRef<HTMLDivElement | null>(null);
  const bidRef = useRef<HTMLDivElement | null>(null);
  // When highlightedPrice changes (via Jump), try to find and scroll the matching row into view.
  // We store prices with 8 decimals in `data-price` attributes and look up the exact string.
  useEffect(() => {
    if (highlightedPrice == null) return;
    const key = highlightedPrice.toFixed(8);
    const askEl = askRef.current?.querySelector(`[data-price="${key}"]`) as HTMLElement | null;
    const bidEl = bidRef.current?.querySelector(`[data-price="${key}"]`) as HTMLElement | null;
    const targetEl = askEl ?? bidEl;
    if (targetEl) {
      try { targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { /* ignore */ }
    }
  }, [highlightedPrice]);

  if (!snapshot) {
    return (
      <div className="text-sm text-gray-500">
        Waiting for orderbook snapshot...
      </div>
    );
  }

  const { bids, asks } = snapshot;

  const { maxSize: maxAskSize } = normalizeLevels(asks);
  const { maxSize: maxBidSize } = normalizeLevels(bids);

  const maxSize = Math.max(maxAskSize, maxBidSize);
  const ROW_HEIGHT = 18; // px (including content)
  const ROW_GAP = 6; // px (margin between rows)
  const columnHeight = `${maxRows * (ROW_HEIGHT + ROW_GAP)}px`;
  
  
  return (
    <div className="heatmap-container" style={{
      background: '#121212',
      padding: '10px',
      borderRadius: '8px',
      display: 'flex',
      gap: '30px',
      alignItems: 'flex-start',
      minWidth: '640px',
      maxWidth: '900px'
    }}>
      {/* ASK SIDE */}
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "4px 0", color: "#cc0000", fontSize: "14px", fontWeight: "bold", fontFamily: "'JetBrains Mono', monospace" }}>Asks</h3>
        <div ref={askRef} style={{ height: columnHeight, overflowY: 'auto', paddingRight: 6 }}>
        {asks.filter(lvl => lvl.size >= 0.0001).map((lvl, i) => {
          const pct = maxSize > 0 ? (lvl.size / maxSize) * 100 : 0;
          const isHighlighted = highlightedPrice != null && lvl.price.toFixed(8) === highlightedPrice.toFixed(8);
          return (
            <div
              key={`ask-${lvl.price}-${i}`}
              className="heatmap-row"
              data-price={lvl.price.toFixed(8)}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 64px 1.5fr',
                alignItems: 'center',
                height: '18px',
                marginBottom: '6px',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                background: isHighlighted ? 'linear-gradient(90deg, rgba(255,80,80,0.12), rgba(255,80,80,0.04))' : '#1e1e1e',
                borderRadius: '4px'
              }}
              title={`Price: ${lvl.price.toFixed(2)}\nSize: ${lvl.size.toFixed(4)}`}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1e1e1e'}
            >
                <div style={{ textAlign: "right", paddingRight: "8px", color: isHighlighted ? '#ffd7d7' : "#ff6b6b", fontWeight: isHighlighted ? 700 : 400 }}>
                {lvl.price.toFixed(1)}
              </div>
              <div style={{ textAlign: "right", paddingRight: "8px", color: "#ffffff" }}>
                {lvl.size.toFixed(2)}
              </div>
              <div className="heatmap-bar-container" style={{
                background: 'rgba(255, 255, 255, 0.06)',
                height: '14px',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  className="heatmap-bar-ask"
                  style={{
                    width: `${pct}%`,
                    minWidth: pct > 0 ? '12px' : '0px',
                    background: pct > 0 ? 'linear-gradient(to right, rgba(255, 70, 70, 0.9), rgba(255, 110, 110, 0.7))' : 'transparent',
                    height: '100%',
                    borderRadius: '4px',
                    boxShadow: isHighlighted ? '0 0 12px rgba(255,80,80,0.28)' : (pct > 0 ? '0 0 8px rgba(255,80,80,0.18)' : 'none')
                  }}
                />
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* BID SIDE */}
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "4px 0", color: "#00aa00", fontSize: "14px", fontWeight: "bold", fontFamily: "'JetBrains Mono', monospace" }}>Bids</h3>
        <div ref={bidRef} style={{ height: columnHeight, overflowY: 'auto', paddingRight: 6 }}>
        {bids.filter(lvl => lvl.size >= 0.0001).map((lvl, i) => {
          const pct = maxSize > 0 ? (lvl.size / maxSize) * 100 : 0;
          const isHighlighted = highlightedPrice != null && lvl.price.toFixed(8) === highlightedPrice.toFixed(8);
          return (
            <div
              key={`bid-${lvl.price}-${i}`}
              className="heatmap-row"
              data-price={lvl.price.toFixed(8)}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 64px 1.5fr',
                alignItems: 'center',
                height: '18px',
                marginBottom: '6px',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                background: isHighlighted ? 'linear-gradient(90deg, rgba(60,200,120,0.08), rgba(60,200,120,0.02))' : '#1e1e1e',
                borderRadius: '4px'
              }}
              title={`Price: ${lvl.price.toFixed(2)}\nSize: ${lvl.size.toFixed(4)}`}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1e1e1e'}
            >
              <div style={{ textAlign: "right", paddingRight: "8px", color: isHighlighted ? '#e6fff0' : "#4ade80", fontWeight: isHighlighted ? 700 : 400 }}>
                {lvl.price.toFixed(1)}
              </div>
              <div style={{ textAlign: "right", paddingRight: "8px", color: "#ffffff" }}>
                {lvl.size.toFixed(2)}
              </div>
              <div className="heatmap-bar-container" style={{
                background: 'rgba(255, 255, 255, 0.06)',
                height: '14px',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  className="heatmap-bar-bid"
                  style={{
                    width: `${pct}%`,
                    minWidth: pct > 0 ? '12px' : '0px',
                    background: pct > 0 ? 'linear-gradient(to right, rgba(0, 160, 0, 0.9), rgba(80, 200, 120, 0.7))' : 'transparent',
                    height: '100%',
                    borderRadius: '4px',
                    boxShadow: isHighlighted ? '0 0 12px rgba(60,200,120,0.18)' : (pct > 0 ? '0 0 8px rgba(60,200,120,0.12)' : 'none')
                  }}
                />
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

// (no module-scope effects remain)
