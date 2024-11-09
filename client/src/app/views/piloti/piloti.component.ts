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

interface Pilota {
  username: string;
  name: string;
  surname: string;
  description: string;
  car: string;
  pilot: string;
  championship : number,
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
  piloti: any[] = [];

  constructor(private dbData: DbDataService) {} //aggiunto il servizio per dati db


  ngOnInit(): void {
    
    this.piloti = this.dbData.getAllDrivers();
    console.log(this.piloti)

    //const allDrivers = JSON.parse(await this.dbData.getAllDrivers());
    // const allPiloti: Pilota[] = [];
    // for (const key in allDrivers) {
    //   console.log(`${key} --> ${allDrivers[key]["username"]}`);
    //   const pilota: Pilota = ({} as any) as Pilota;
    //   pilota.username = allDrivers[key]["username"];
    //   pilota.name = allDrivers[key]["name"];
    //   pilota.surname = allDrivers[key]["surname"];
    //   pilota.description = allDrivers[key]["description"];
    //   pilota.race = allDrivers[key]["race_points"];
    //   pilota.qualify = allDrivers[key]["qualifying_points"];
    //   pilota.practice = allDrivers[key]["free_practice_points"];
    //   pilota.championship = pilota.race + pilota.qualify + pilota.practice;
    //   pilota.position = 1;
    //   pilota.lastwin = '16/16/16'
    //   pilota.avatar = './assets/images/avatars/1.jpg';
    //   pilota.car = './assets/images/constructors/haas.svg';
    //   pilota.color = 'success';
    //   pilota.pilot = 'Leclerc';
    //   pilota.radarData = [allDrivers[key]["consistency_pt"], allDrivers[key]["fast_lap_pt"], allDrivers[key]["dangerous_pt"], allDrivers[key]["ingenuity_pt"], allDrivers[key]["strategy_pt"]];
    //   allPiloti.push(pilota);
    // }


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
            data: pilota.radarData
          }
        ]
      };
    });
  }
}
