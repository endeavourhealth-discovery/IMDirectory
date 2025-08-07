import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { Env } from "@/services";

let stompClient: Client | null = null;
let subscription: StompSubscription | null = null;

export function connectWebSocket(userId: string, token: string, onMessage: (msg: any) => void): void {
  const socket = new SockJS(Env.API + "ws?token=" + encodeURIComponent(token));

  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: str => console.log("[STOMP]", str),
    onConnect: () => {
      console.log("[WebSocket] connected");
      subscription = stompClient!.subscribe("/user/userQueryQueue-user" + userId, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          onMessage(data);
        } catch (err) {
          console.error("Failed to parse message", err);
        }
      });
    },
    onStompError: frame => {
      console.error("[Websocket] STOMP error:", frame);
    }
  });

  stompClient.activate();
}

export function disconnectWebSocket(): void {
  if (subscription) {
    subscription.unsubscribe();
  }
  if (stompClient) {
    stompClient.deactivate();
    console.log("[Websocket] Disconnected");
  }
}
