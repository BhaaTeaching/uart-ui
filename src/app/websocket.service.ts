import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { SensorData } from 'src/SensorData';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<SensorData | null>(null);
  public messages$: Observable<SensorData | null> = this.messageSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socket = new SockJS('http://localhost:8082/ws-endpoint');
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      this.stompClient?.subscribe('/topic/response', (message: IMessage) => {
        const parsedData = JSON.parse(message.body) as SensorData;
        debugger;
        this.addMessage(parsedData);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('WebSocket Error: ', frame);
    };

    this.stompClient.activate();
  }

  sendMessage(message: string): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/message',
        body: message
      });
    } else {
      console.error('WebSocket connection is not active.');
    }
  }

  private addMessage(message: SensorData): void {
    const currentMessages = this.messageSubject.getValue();
    this.messageSubject.next(message);
  }
}
