import { Component } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { Subscription } from 'rxjs';
import { SensorData } from 'src/SensorData';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  newMessage = '';
  messages: SensorData | null = null;
  private subscription!: Subscription;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.subscription = this.websocketService.messages$.subscribe((messages: SensorData | null) => {
      if (messages) {
        this.messages = messages;
        console.log('Received messages:', messages);
      }
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.websocketService.sendMessage(this.newMessage);
      this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
