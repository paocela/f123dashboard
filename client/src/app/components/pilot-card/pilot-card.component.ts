import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CardBodyComponent,
  CardComponent,
  CardImgDirective,
  CardTextDirective,
  CardTitleDirective,
  ListGroupDirective,
  ListGroupItemDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { DriverData } from '@genezio-sdk/f123dashboard';

@Component({
  selector: 'app-pilot-card',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    CardTitleDirective,
    CardTextDirective,
    ListGroupDirective,
    ListGroupItemDirective,
    CardImgDirective,
    ChartjsComponent
  ],
  templateUrl: './pilot-card.component.html',
  styleUrl: './pilot-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PilotCardComponent implements OnInit {
  @Input() pilota!: DriverData;
  @Input() position!: number;

  // Variabili per la personalizzazione del radar chart
  private readonly CHART_TEXT_COLOR = 'rgba(130, 130, 130, 1)';
  private readonly CHART_TEXT_SIZE = 12;

  // Opzioni per il radar chart
  radarChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(130, 130, 130, 1)',
          lineWidth: 1,
        },
        ticks: {
          display: false,
          stepSize: 1,
        },
        pointLabels: {
          color: this.CHART_TEXT_COLOR,
          font: {
            size: this.CHART_TEXT_SIZE,
            weight: 'normal'
          }
        }
      }
    },
    elements: {
      line: {
        borderWidth: 1,
      }
    },
    layout: {
      padding: 5
    },
    plugins: {
      legend: {
        display: false,
        position: 'top'
      },
      title: {
        display: false,
        text: 'Performance Radar Chart'
      }
    }
  };

  radarChartData: any;

  ngOnInit(): void {
    this.initializeRadarChartData();
  }

  /**
   * Initializes radar chart data for the pilot
   */
  private initializeRadarChartData(): void {
    this.radarChartData = {
      labels: ['Costanza', 'Veloce', 'Rischio', 'Errori', 'Tattica'],
      datasets: [
        {
          label: this.pilota.driver_name,
          backgroundColor: 'rgba(255,181,198,0.3)',
          borderColor: 'rgba(255,180,180,0.8)',
          pointBackgroundColor: 'rgba(255,180,180,0.8)',
          pointBorderColor: 'rgba(255,180,180,0.8)',
          data: [
            this.pilota.driver_consistency_pt, 
            this.pilota.driver_fast_lap_pt, 
            this.pilota.drivers_dangerous_pt, 
            this.pilota.driver_ingenuity_pt, 
            this.pilota.driver_strategy_pt
          ]
        }
      ]
    };
  }
}
