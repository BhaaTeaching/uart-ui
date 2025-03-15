import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Subscription } from 'rxjs';
import { SensorData } from 'src/app/models/SensorData';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  newMessage = '';
  messages: SensorData | null = null;
  private subscription!: Subscription;
  chart: any;
  timeLabels: string[] = [];
  humidityData: number[] = []; 
  temperatureData: number[] = []; 
  maxDataPoints = 10;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.initializeChart();

    this.subscription = this.websocketService.messages$.subscribe((messages: SensorData | null) => {
      if (messages) {
        this.messages = messages;
        console.log('Received messages:', messages);
        this.updateChart(messages);
      }
    });
  }

  initializeChart(): void {
    const ctx = document.getElementById('canvas') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Humidity (%)',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Temperature (°C)',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: 'Time' },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Value' },
          }
        }
      }
    });
  }

  updateChart(messages: SensorData): void {
    const now = new Date().toLocaleTimeString(); 

    if (this.timeLabels.length >= this.maxDataPoints) {
      this.timeLabels.shift();
      this.humidityData.shift();
      this.temperatureData.shift();
    }

    this.timeLabels.push(now);
    this.humidityData.push(messages.humidity);
    this.temperatureData.push(messages.temperature);

    if (this.chart) {
      this.chart.data.labels = this.timeLabels;
      this.chart.data.datasets[0].data = this.humidityData;
      this.chart.data.datasets[1].data = this.temperatureData;
      this.chart.update();
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.websocketService.sendMessage(this.newMessage);
      this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
