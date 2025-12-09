// TODO: Implement reusable WebSocket client with basic reconnect and event listeners
// src/api/wsClient.ts

type MessageHandler = (data: any) => void;
type OpenHandler = () => void;
type CloseHandler = (event: CloseEvent) => void;
type ErrorHandler = (event: Event) => void;

export class WsClient {
  private url: string;
  private ws: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private openHandlers: OpenHandler[] = [];
  private closeHandlers: CloseHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.openHandlers.forEach((h) => h());
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach((h) => h(data));
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    this.ws.onclose = (event) => {
      this.closeHandlers.forEach((h) => h(event));
    };

    this.ws.onerror = (event) => {
      this.errorHandlers.forEach((h) => h(event));
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WS not open, cannot send", payload);
      return;
    }
    this.ws.send(JSON.stringify(payload));
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
  }

  onOpen(handler: OpenHandler) {
    this.openHandlers.push(handler);
  }

  onClose(handler: CloseHandler) {
    this.closeHandlers.push(handler);
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
  }
}
