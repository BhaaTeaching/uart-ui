export class SensorData {
    humidity: number;
    id: number;
    temperature: number;
  
    constructor( humidity: number, id: number, temperature: number) {
      this.humidity = humidity;
      this.id = id;
      this.temperature = temperature;
    }
  }
  