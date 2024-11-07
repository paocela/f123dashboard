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

interface Pilota {
  username: string;
  name: string;
  surname: string;
  description: string;
  car: string;
  pilot: string;
  Championship : number,
  race:number,
  qualify: number,
  sprint: number,
  practice: number,
  position: number;
  lastwin: string;
  avatar: string;
  color: string;
  radarData: number[];
  radarChartData?: ChartData<'radar'>;  // Dati Radar Chart precomputati
}

@Component({
  selector: 'app-cards',
  templateUrl: './piloti.component.html',
  styleUrls: ['./piloti.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,  // Utilizzo di OnPush
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    DocsExampleComponent,
    NgTemplateOutlet,
    CardTitleDirective,
    CardTextDirective,
    ButtonDirective,
    CardSubtitleDirective,
    CardLinkDirective,
    RouterLink,
    ListGroupDirective,
    ListGroupItemDirective,
    CardFooterComponent,
    BorderDirective,
    CardGroupComponent,
    GutterDirective,
    CardImgDirective,
    TabsComponent,
    TabsListComponent,
    IconDirective,
    TabDirective,
    TabsContentComponent,
    TabPanelComponent,
    ChartjsComponent  // Aggiungi il modulo per i grafici
  ]
})
export class PilotiComponent implements OnInit {

  


  // Opzioni comuni per il radar chart
  radarChartOptions: ChartOptions<'radar'> = {
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 1)', // Cambia il colore delle linee di base
          lineWidth: 2, // Imposta la larghezza delle linee
        },
        ticks: {
          display: false, // Rimuove i numeri
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
  piloti!: Pilota[];

  constructor(private dbData: DbDataService) {} //aggiunto il servizio per dati db


  async ngOnInit(): Promise<void> {
    //richiesta dati al db
    //this.piloti = this.dbData.getPiloti();
    const allDrivers = JSON.parse(await this.dbData.getAllDrivers());


    // HOW TO FUCKING LOOOOOOOP??????????????
  
  


    this.initializeRadarChartData();
  }

  /**
   * Precomputa i dati del radar chart per ogni pilota.
   */
  initializeRadarChartData(): void {
    this.piloti.forEach(pilota => {
      pilota.radarChartData = {
        labels: ['Giro Veloce', 'Pericolosità', 'Ingenuità', 'Strategia', 'Consistenza'],
        datasets: [
          {
            label: pilota.pilot,
            backgroundColor: 'rgba(255,181,198,0.3)',
            borderColor: 'rgba(255,180,180,0.8)',
            pointBackgroundColor: 'rgba(255,180,180,0.8)',
            pointBorderColor: 'rgba(255,180,180,0.8)',
            data: pilota.radarData
          }
        ]
      };
    });
  }
}
