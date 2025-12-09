// src/app/App.tsx

import { useEffect } from "react";
import { getKrakenWsService } from "../api/krakenWsService";

function App() {
  useEffect(() => {
    const service = getKrakenWsService();

    service.onMessage((data) => {
      console.log("RAW KRAKEN MESSAGE:", data);
    });

    service.onOpen(() => {
      console.log("Kraken WS connected, subscribing...");
      service.subscribeOrderBook();
      service.subscribeTrades();
    });

    service.connect();

    return () => {
      service.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-xl font-bold mb-2">Kraken Depth Explorer (WS Test)</h1>
        <p>Open the browser console to see raw WebSocket messages.</p>
      </div>
    </div>
  );
}

export default App;
