import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { DocsExampleComponent } from '@docs-components/public-api';
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
  description: string;
  car: string;
  pilot: string;
  points: number;
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

  piloti: Pilota[] = [
    {
      username: 'redmamba_99_',
      description: 'Non è bravo come programmatore ma come pilota se la cava. Durante la scorsa stagione ha fatto notare la sua crescita vincendo il campionato.',
      car: './assets/images/constructors/alpine.svg',
      pilot: 'Gasly',
      points: 500,
      position: 1,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/1.jpg',
      color: 'success',
      radarData: [80, 20, 10, 70, 90]
    },
    {
      username: 'GiannisCorbe',
      description: 'Descrizione per GiannisCorbe.',
      car: './assets/images/constructors/haas.svg',
      pilot: 'Magnussen',
      points: 400,
      position: 2,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/2.jpg',
      color: 'danger',
      radarData: [90, 30, 50, 70, 90]
    },
    {
      username: 'HeavyButt',
      description: 'Descrizione per HeavyButt.',
      car: './assets/images/constructors/mercedes.svg',
      pilot: 'Hamilton',
      points: 300,
      position: 3,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/3.jpg',
      color: 'info',
      radarData: [60, 100, 70, 90, 60]
    },
    {
      username: 'Marcogang97',
      description: 'Descrizione per Marcogang97.',
      car: './assets/images/constructors/ferrari.svg',
      pilot: 'Leclerc',
      points: 200,
      position: 4,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/4.jpg',
      color: 'secondary',
      radarData: [60, 30, 80, 30, 50]
    },
    {
      username: 'FASTman',
      description: 'Descrizione per FASTman.',
      car: './assets/images/constructors/redbull.svg',
      pilot: 'Verstappen',
      points: 100,
      position: 5,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/5.jpg',
      color: 'primary',
      radarData: [50, 30, 80, 40, 50]
    }
  ];

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

  constructor() {}

  ngOnInit(): void {
    this.initializeRadarChartData();
  }

  /**
   * Precomputa i dati del radar chart per ogni pilota.
   */
  initializeRadarChartData(): void {
    this.piloti.forEach(pilota => {
      pilota.radarChartData = {
        labels: ['veloce', 'pericoloso', 'suicida', 'stratega', 'Consistenza'],
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
      console.log(`Radar Chart Data for ${pilota.pilot}:`, pilota.radarChartData);
    });
  }
}
