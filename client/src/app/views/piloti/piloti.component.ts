import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { DocsExampleComponent } from '@docs-components/public-api';
import {DbDataService} from 'src/app/service/db-data.service';  //aggiunto il servizio per dati db
import { ChartData, ChartOptions } from 'chart.js';  // Import per i grafici
import { 
  BorderDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardGroupComponent,
  CardHeaderComponent,
  CardImgDirective,
  CardLinkDirective,
  CardSubtitleDirective,
  CardTextDirective,
  CardTitleDirective,
  ColComponent,
  GutterDirective,
  ListGroupDirective,
  ListGroupItemDirective,
  RowComponent,
  TabDirective,
  TabPanelComponent,
  TabsComponent,
  TabsContentComponent,
  TabsListComponent,
  TextColorDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';  // Import per il componente grafici
import { IconDirective } from '@coreui/icons-angular';
import { ChangeDetectorRef } from '@angular/core';


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
    ChartjsComponent // Aggiungi il modulo per i grafici
]
})
export class PilotiComponent implements OnInit {

  piloti: any[] = [];
  pilotChart: any[] = [];


  // Opzioni comuni per il radar chart
  radarChartOptions: ChartOptions<'radar'> = {
    responsive: true,
  maintainAspectRatio: true, // Mantiene il grafico quadrato
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(200, 200, 200, 1)', // Cambia il colore delle linee di base
          lineWidth: 2, // Imposta la larghezza delle linee
        },
        ticks: {
          display: false, // Rimuove i numeri
          stepSize:1,
        }
      }
    },
    
    elements: {
      line: {
        borderWidth: 3
      }
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


  ngOnInit(): void {

    //richiesta di dati dal servizio
    this.piloti = this.dbData.getAllDrivers();

    this.initializeRadarChartData();
  }



  /**
   * Precomputa i dati del radar chart per ogni pilota.
   */
  initializeRadarChartData(): void {
    this.piloti.forEach(pilota => {
      pilota.radarChartData = {
        labels: ['Consistenza', 'Giro Veloce', 'Pericolosità', 'Ingenuità', 'Strategia'],
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
