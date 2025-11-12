import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Weather } from './services/weather';

interface FavoriteCity {
  name: string;
  temp: number;
  condition: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  weather: any;
  forecast: any[] = [];
  loading = false;
  errorMessage = '';
  isCelsius = true;
  favoriteCities: FavoriteCity[] = [
  ];

  constructor(private weatherService: Weather) {}

  ngOnInit() {
    this.getLocation();
  }

  getLocation() {
    if (navigator.geolocation) {
      this.loading = true;
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          this.weatherService.getWeatherByCoords(latitude, longitude)
            .subscribe({
              next: res => {
                this.weather = res;
                this.loading = false;
                this.generateMockForecast();
              },
              error: () => {
                this.errorMessage = 'No se pudo obtener el clima actual.';
                this.loading = false;
              }
            });
        },
        () => {
          this.errorMessage = 'No se pudo acceder a la ubicación.';
          this.loading = false;
        }
      );
    } else {
      this.errorMessage = 'La geolocalización no está soportada en este navegador.';
    }
  }

  getWeather(cityName: string) {
    this.loading = true;
    this.weatherService.getWeather(cityName)
      .subscribe({
        next: res => {
          this.weather = res;
          this.loading = false;
          this.errorMessage = '';
          this.generateMockForecast();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Ciudad no encontrada.';
        }
      });
  }

  submitLocation(event: Event) {
    event.preventDefault();
    const input = (event.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
    if (input.value) {
      this.getWeather(input.value);
      input.value = '';
    }
  }

  toggleUnit() {
    this.isCelsius = !this.isCelsius;
  }

  getTemperature(tempC: number): number {
    return this.isCelsius ? tempC : (tempC * 9/5) + 32;
  }

  getUnit(): string {
    return this.isCelsius ? '°C' : '°F';
  }

  addToFavorites() {
    if (!this.weather) return;

    const cityExists = this.favoriteCities.some(city =>
      city.name.toLowerCase() === this.weather.name.toLowerCase()
    );

    if (cityExists) {
      alert('Esta ciudad ya está en favoritos');
      return;
    }

    const newFavorite: FavoriteCity = {
      name: this.weather.name,
      temp: Math.round(this.weather.main.temp),
      condition: this.weather.weather[0].description
    };

    this.favoriteCities.push(newFavorite);
    alert(`${this.weather.name} agregada a favoritos`);
  }

  loadFavoriteCity(city: FavoriteCity) {
    this.getWeather(city.name);
  }

  generateMockForecast() {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    const icons = ['01d', '02d', '03d', '10d', '10d'];
    this.forecast = days.map((day, i) => ({
      day,
      icon: icons[i],
      maxTemp: Math.round(this.weather.main.temp + Math.random() * 5 - 2),
      minTemp: Math.round(this.weather.main.temp - Math.random() * 8)
    }));
  }

  getWeatherIcon(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  getSunriseTime(): string {
    if (!this.weather) return '';
    const date = new Date(this.weather.sys.sunrise * 1000);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  getSunsetTime(): string {
    if (!this.weather) return '';
    const date = new Date(this.weather.sys.sunset * 1000);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  getWindSpeed(): number {
    return this.weather ? Math.round(this.weather.wind.speed * 3.6) : 0;
  }

  getUVIndex(): string {
    return 'Alto';
  }
}
