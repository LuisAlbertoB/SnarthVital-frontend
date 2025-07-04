import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CardsComponent } from '../../components/cards/cards.component';
import { ChartModule } from 'primeng/chart';


@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, NavbarComponent, CardsComponent, ChartModule],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent {
heartRateData = {
    labels: ['1s', '2s', '3s', '4s', '5s'],
    datasets: [
      {
        label: 'ppm',
        data: [72, 75, 73, 74, 72],
        borderColor: '#EC407A',
        fill: false,
        tension: 0.4
      }
    ]
  };

  spo2Data = {
    labels: ['1s', '2s', '3s', '4s', '5s'],
    datasets: [
      {
        label: 'SpO2 %',
        backgroundColor: '#42A5F5',
        data: [96, 97, 98, 98, 97]
      }
    ]
  };

  temperatureData = {
    labels: ['1s', '2s', '3s', '4s', '5s'],
    datasets: [
      {
        label: '°C',
        data: [36.6, 36.7, 36.8, 36.8, 36.9],
        borderColor: '#FFA726',
        fill: false,
        tension: 0.4
      }
    ]
  };

  bloodPressureData = {
    labels: ['1s', '2s', '3s', '4s', '5s'],
    datasets: [
      {
        label: 'Sistólica',
        borderColor: '#66BB6A',
        data: [120, 121, 119, 122, 121],
        fill: false
      },
      {
        label: 'Diastólica',
        borderColor: '#FF7043',
        data: [80, 82, 79, 81, 80],
        fill: false
      }
    ]
  };

  eegData = {
    labels: ['1s', '2s', '3s', '4s', '5s'],
    datasets: [
      {
        label: 'Voltaje',
        borderColor: '#AB47BC',
        data: [0.5, 0.8, 0.6, 0.7, 0.6],
        fill: false,
        tension: 0.4
      }
    ]
  };

  lineChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 100 } }
  };

  barChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } }
  };

  multiAxisOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        min: 60,
        max: 140
      }
    }
  };
}


