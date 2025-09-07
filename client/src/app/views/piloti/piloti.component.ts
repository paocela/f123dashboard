import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { DbDataService } from '../../service/db-data.service';  // aggiunto il servizio per dati db
import { ChartData, ChartOptions } from 'chart.js';  // Import per i grafici
import { 
  BorderDirective,
  CardBodyComponent,
  CardComponent,
  CardImgDirective,
  CardTextDirective,
  CardTitleDirective,
  ColComponent,
  ListGroupDirective,
  ListGroupItemDirective,
  RowComponent,
  TextColorDirective,
  Tabs2Module
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';  // Import per il componente grafici
import { Constructor } from '../../model/constructor';

@Component({
    selector: 'app-cards',
    templateUrl: './piloti.component.html',
    styleUrls: ['./piloti.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush, // Utilizzo di OnPush
    imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    CardTitleDirective,
    CardTextDirective,
    ListGroupDirective,
    ListGroupItemDirective,
    BorderDirective,
    CardImgDirective,
    ChartjsComponent,
    Tabs2Module
  ]
})

export class PilotiComponent implements OnInit {

  piloti: any[] = [];
  constructors: Constructor[] = [];
  pilotChart: any[] = [];

  // Variabili per la personalizzazione del radar chart
  private readonly CHART_TEXT_COLOR = 'rgba(130, 130, 130, 1)';
  private readonly CHART_TEXT_SIZE = 12;

  // Opzioni comuni per il radar chart
  radarChartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false, // Mantiene il grafico quadrato
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(130, 130, 130, 1)', // Cambia il colore delle linee di base
          lineWidth: 1, // Imposta la larghezza delle linee
        },
        ticks: {
          display: false, // Rimuove i numeri
          stepSize: 1,
        },
        pointLabels: {
          color: this.CHART_TEXT_COLOR, // Colore del testo configurabile
          font: {
            size: this.CHART_TEXT_SIZE, // Dimensione del testo configurabile
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
      padding: 5 // Aggiunge un margine di 5 pixel intorno al grafico
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


  constructor(private dbData: DbDataService) {} //aggiunto il servizio per dati db


  async ngOnInit(): Promise<void> {

    //richiesta di dati dal servizio
    this.piloti = this.dbData.getAllDrivers();
    this.constructors = await this.dbData.getConstructors(1);

    this.initializeRadarChartData();
  }



  /**
   * Precomputa i dati del radar chart per ogni pilota.
   */
  initializeRadarChartData(): void {
    this.piloti.forEach(pilota => {
      pilota.radarChartData = {
        labels: ['Costanza', 'Veloce', 'Rischio', 'Errori', 'Tattica'],
        datasets: [
          {
            label: pilota.pilot,
            backgroundColor: 'rgba(255,181,198,0.3)',
            borderColor: 'rgba(255,180,180,0.8)',
            pointBackgroundColor: 'rgba(255,180,180,0.8)',
            pointBorderColor: 'rgba(255,180,180,0.8)',
            data: [pilota.driver_consistency_pt, 
              pilota.driver_fast_lap_pt, 
              pilota.drivers_dangerous_pt, 
              pilota.driver_ingenuity_pt, 
              pilota.driver_strategy_pt]
          }
        ],
        
      };
    });
  }
}
