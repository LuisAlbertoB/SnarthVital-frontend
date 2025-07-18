import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MedicalRecordService } from '../../../features/medicalRecord/medical-record.service';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../features/user/user.service';
import { PatientStadistics } from '../../../features/medicalRecord/models/patient-stadistics';
import { Record } from '../../../features/medicalRecord/models/record';
import { User } from '../../../features/user/models/user';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressBarModule } from 'primeng/progressbar';

Chart.register(...registerables);

@Component({
  selector: 'app-stadistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    NavbarComponent,
    SelectModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DatePickerModule,
    ProgressBarModule
  ],
  templateUrl: './stadistics.component.html',
  styleUrl: './stadistics.component.css'
})
export class StadisticsComponent implements OnInit {
  currentUser!: User;
  patients: User[] = [];
  selectedPatient: User | undefined;
  patientOptions: any[] = [];
  statistics!: PatientStadistics;
  medicalRecords: Record[] = [];
  rangeDates: Date[] | undefined;

  // Configuraciones de gráficos
  public barChartType: ChartType = 'bar';
  public lineChartType: ChartType = 'line';
  public radarChartType: ChartType = 'radar';

  // Datos para gráfico de barras (estadísticas)
  public statsBarChartData: ChartData<'bar'> = {
    labels: ['Temperatura', 'Frecuencia Cardíaca', 'Saturación O2'],
    datasets: []
  };

  public statsBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: 'Estadísticas de Signos Vitales'
      }
    }
  };

  // Datos para gráfico de riesgos (radar)
  public riskRadarChartData: ChartData<'radar'> = {
    labels: [],
    datasets: []
  };

  public riskRadarChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: 'Probabilidades de Riesgo (%)'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  // Datos para gráfico de rangos (line)
  public rangeLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public rangeLineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: 'Comparación con Rangos de Riesgo'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Datos para gráfico de evolución de temperatura
  public temperatureEvolutionChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public temperatureEvolutionChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: 'Evolución de Temperatura con Análisis Estadístico'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temperatura (°C)'
        },
        beginAtZero: false
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  constructor(
    private authService: AuthService,
    private recordService: MedicalRecordService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    if (this.authService.getUser()) {
      this.currentUser = this.authService.getUser() as User;
    }

    if (this.currentUser.role === 'doctor') {
      this.loadPatients();
    } else if (this.currentUser.role === 'patient') {
      this.loadPatientStatistics(this.currentUser.id!);
    }
  }

  loadPatients(): void {
    if (!this.currentUser.id) {
      console.error('Doctor ID is not available');
      return;
    }
    this.userService.getPatients(this.currentUser.id).subscribe({
      next: (data) => {
        this.patients = data;
        this.patientOptions = data.map(patient => ({
          label: `${patient.name} ${patient.lastname}`,
          value: patient
        }));
      },
      error: (error) => {
        console.error('Error fetching patients:', error);
      }
    });
  }

  onPatientChange(): void {
    if (this.selectedPatient?.id) {
      this.loadPatientStatistics(this.selectedPatient.id);
    }
  }

  loadPatientStatistics(patientId: number): void {
    if (this.rangeDates && this.rangeDates.length > 0 && this.rangeDates[0]) {
      const startDate = this.rangeDates[0].toISOString().split('T')[0];
      const endDate = (this.rangeDates[1] ? this.rangeDates[1] : this.rangeDates[0]).toISOString().split('T')[0];

      // Obtener estadísticas que ya incluyen los registros
      this.recordService.getPatientStatisticsByRange(patientId, startDate, endDate).subscribe({
        next: (data: any) => {
          this.statistics = data;
          this.medicalRecords = data.records;
          this.updateCharts();
        },
        error: (error) => {
          console.error('Error fetching patient data by range:', error);
        }
      });
    } else {
      // Obtener estadísticas que ya incluyen los registros
      this.recordService.getPatientStatistics(patientId).subscribe({
        next: (data) => {
          this.statistics = data;
          this.medicalRecords = data.records;
          this.updateCharts();
        },
        error: (error) => {
          console.error('Error fetching patient data:', error);
        }
      });
    }
  }

  applyDateFilter(): void {
    if (this.currentUser.role === 'patient') {
      this.loadPatientStatistics(this.currentUser.id!);
    } else if (this.selectedPatient?.id) {
      this.loadPatientStatistics(this.selectedPatient.id);
    }
  }

  updateCharts(): void {
    if (!this.statistics) return;

    this.updateStatsBarChart();
    this.updateRiskRadarChart();
    this.updateRangeLineChart();
    this.updateTemperatureEvolutionChart();
  }

  updateStatsBarChart(): void {
    const stats = this.statistics.data.estadisticas;

    this.statsBarChartData = {
      labels: ['Temperatura (°C)', 'Frecuencia Cardíaca (bpm)', 'Saturación O2 (%)'],
      datasets: [
        {
          label: 'Mínimo',
          data: [stats.temperatura.minimo, stats.frecuencia_cardiaca.minimo, stats.saturacion_oxigeno.minimo],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Media',
          data: [stats.temperatura.media, stats.frecuencia_cardiaca.media, stats.saturacion_oxigeno.media],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Máximo',
          data: [stats.temperatura.maximo, stats.frecuencia_cardiaca.maximo, stats.saturacion_oxigeno.maximo],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  updateRiskRadarChart(): void {
    const risks = this.statistics.data.probabilidades_riesgo;

    if (!risks) return;

    this.riskRadarChartData = {
      labels: [
        'Taquicardia',
        'Bradicardia',
        'Taquipnea',
        'Bradipnea',
        'Fiebre',
        'Hipotermia',
        'Hipertensión',
        'Hipotensión',
        'Baja Saturación'
      ],
      datasets: [
        {
          label: 'Probabilidad de Riesgo (%)',
          data: [
            risks.riesgo_taquicardia,
            risks.riesgo_bradicardia,
            risks.riesgo_taquipnea,
            risks.riesgo_bradipnea,
            risks.riesgo_fiebre,
            risks.riesgo_hipotermia,
            risks.riesgo_hipertension,
            risks.riesgo_hipotension,
            risks.riesgo_baja_saturacion
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
        }
      ]
    };
  }

  updateRangeLineChart(): void {
    const stats = this.statistics.data.estadisticas;
    const params = this.statistics.data.parametros;

    this.rangeLineChartData = {
      labels: ['Temperatura', 'Frecuencia Cardíaca', 'Saturación O2'],
      datasets: [
        {
          label: 'Valor Actual (Media)',
          data: [stats.temperatura.media, stats.frecuencia_cardiaca.media, stats.saturacion_oxigeno.media],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 3,
          tension: 0.1
        },
        {
          label: 'Límite Inferior Riesgo',
          data: [params.rango_hipotermia, params.rango_bradicardia, params.rango_baja_saturacion],
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.1
        },
        {
          label: 'Límite Superior Riesgo',
          data: [params.rango_fiebre, params.rango_taquicardia, 100],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.1
        }
      ]
    };
  }

  getHighestRisk(): string {
    if (!this.statistics) return '';

    const risks = this.statistics.data.probabilidades_riesgo;
    if (!risks) return '';

    const riskNames: { [key: string]: string } = {
      'riesgo_taquicardia': 'Taquicardia',
      'riesgo_bradicardia': 'Bradicardia',
      'riesgo_taquipnea': 'Taquipnea',
      'riesgo_bradipnea': 'Bradipnea',
      'riesgo_fiebre': 'Fiebre',
      'riesgo_hipotermia': 'Hipotermia',
      'riesgo_hipertension': 'Hipertensión',
      'riesgo_hipotension': 'Hipotensión',
      'riesgo_baja_saturacion': 'Baja Saturación'
    };

    let maxRisk = 0;
    let maxRiskName = '';

    Object.entries(risks).forEach(([key, value]) => {
      const riskValue = value as number;
      if (riskValue > maxRisk) {
        maxRisk = riskValue;
        maxRiskName = riskNames[key];
      }
    });

    return maxRisk > 0 ? `${maxRiskName} (${maxRisk}%)` : 'Sin riesgos detectados';
  }

  getRiskLevel(risk: number): string {
    if (risk >= 70) return 'Alto';
    if (risk >= 40) return 'Medio';
    if (risk > 0) return 'Bajo';
    return 'Sin riesgo';
  }

  getRiskColor(risk: number): string {
    if (risk >= 70) return '#dc3545';
    if (risk >= 40) return '#ffc107';
    if (risk > 0) return '#28a745';
    return '#6c757d';
  }

  get riskData(): any {
    return this.statistics?.data?.probabilidades_riesgo || {};
  }

  getVariance(): number {
    if (!this.statistics) return 0;
    const deviation = this.statistics.data.estadisticas.temperatura.desviacion_estandar;
    return deviation * deviation;
  }

  updateTemperatureEvolutionChart(): void {
    if (!this.medicalRecords || this.medicalRecords.length === 0) return;

    // Ordenar registros por fecha
    const sortedRecords = [...this.medicalRecords].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Extraer datos de temperatura y fechas
    const temperatureData = sortedRecords.map(record => record.temperature);
    const labels = sortedRecords.map(record =>
      new Date(record.created_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    // Obtener estadísticas de temperatura
    const tempStats = this.statistics.data.estadisticas.temperatura;
    const tempParams = this.statistics.data.parametros;

    // Crear líneas de referencia constantes
    const meanLine = new Array(temperatureData.length).fill(tempStats.media);
    const medianLine = new Array(temperatureData.length).fill(tempStats.mediana);
    const stdUpperLine = new Array(temperatureData.length).fill(tempStats.media + tempStats.desviacion_estandar);
    const stdLowerLine = new Array(temperatureData.length).fill(tempStats.media - tempStats.desviacion_estandar);
    const feverLine = new Array(temperatureData.length).fill(tempParams.rango_fiebre);
    const hypothermiaLine = new Array(temperatureData.length).fill(tempParams.rango_hipotermia);

    this.temperatureEvolutionChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Temperatura Registrada',
          data: temperatureData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.1,
          fill: false
        },
        {
          label: `Media (${tempStats.media.toFixed(2)}°C)`,
          data: meanLine,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0,
          fill: false
        },
        {
          label: `Mediana (${tempStats.mediana.toFixed(2)}°C)`,
          data: medianLine,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          borderDash: [10, 5],
          pointRadius: 0,
          tension: 0,
          fill: false
        },
        {
          label: `+1σ (${(tempStats.media + tempStats.desviacion_estandar).toFixed(2)}°C)`,
          data: stdUpperLine,
          backgroundColor: 'rgba(255, 206, 86, 0.1)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
          borderDash: [2, 2],
          pointRadius: 0,
          tension: 0,
          fill: '+1'
        },
        {
          label: `-1σ (${(tempStats.media - tempStats.desviacion_estandar).toFixed(2)}°C)`,
          data: stdLowerLine,
          backgroundColor: 'rgba(255, 206, 86, 0.1)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
          borderDash: [2, 2],
          pointRadius: 0,
          tension: 0,
          fill: false
        },
        {
          label: `Límite Fiebre (${tempParams.rango_fiebre}°C)`,
          data: feverLine,
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 2,
          borderDash: [15, 10],
          pointRadius: 0,
          tension: 0,
          fill: false
        },
        {
          label: `Límite Hipotermia (${tempParams.rango_hipotermia}°C)`,
          data: hypothermiaLine,
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 2,
          borderDash: [15, 10],
          pointRadius: 0,
          tension: 0,
          fill: false
        }
      ]
    };
  }
}
