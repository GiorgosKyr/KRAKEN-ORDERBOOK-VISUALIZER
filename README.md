# Kraken Forge | Orderbook Explorer

🐙 Kraken Forge | Build the tools beneath the surface

Welcome to Kraken Forge. This repository contains an interactive orderbook visualizer and playback tool built for the Kraken Forge hackathon. It demonstrates a React-based orderbook heatmap, timeline playback with time-travel, and liquidity event detection.

This project was created as a hackathon submission and is intended to be reusable, well-documented, and open-source under the MIT license (see LICENSE).

## Highlights

- Real-time orderbook heatmap with volume bars and scroll-to-price highlighting
- Timeline slider with playback, time-travel, and event pins
- Liquidity wall detector and event list with quick-jump buttons
- Lightweight snapshot buffer and playback engine

## Goals

This project follows the Kraken Forge goals:

- Build production-quality, reusable components powered by Kraken's WS API
- Provide tools for visualizing and exploring orderbook behavior over time
- Ship clear documentation and a quick demo for hackathon submission

## Getting started

Prerequisites: Node 16+ and npm or yarn.

Clone the repo and install dependencies:

```bash
git clone https://github.com/GiorgosKyr/KRAKEN-ORDERBOOK-VISUALIZER.git
cd kraken
npm install
```

Run the development server (Vite):

```bash
npm run dev
```

Open http://localhost:5173 (or the Vite URL) to view the app.

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Project Structure

- `src/` — main application source
  - `components/` — reusable UI pieces (heatmap, timeline, controls)
  - `core/` — domain logic (snapshot buffer, orderbook reducer, event detection)
  - `state/` — global stores (Zustand)
  - `hooks/` — playback snapshot hook and helpers
  - `pages/`, `styles/`, `types/`, `utils/`
- `tests/` — unit tests for critical core modules

Key files:

- `src/components/orderbook/OrderbookHeatmap.tsx` — heatmap and scroll-to-highlight logic
- `src/components/playback/TimelineSlider.tsx` — timeline, labels, and centering logic
- `src/core/playback/snapshotBuffer.ts` — in-memory snapshot buffer
- `src/core/events/liquidityEvents.ts` — liquidity wall detection logic

## How to demo (short script)

1. Start the dev server and allow the app to populate orderbook snapshots from Kraken WS.
2. Observe the heatmap updating in real time.
3. Click `Time Travel` then click any `Jump` button in the Liquidity Events list — the timeline will center on the event and the heatmap will highlight the corresponding price row.
4. Use the playback controls to play/pause and change playback speed.

## License

This project is released under the MIT License — see `LICENSE`.

---

