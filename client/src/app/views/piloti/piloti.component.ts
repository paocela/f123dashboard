import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DbDataService } from '../../service/db-data.service';  // aggiunto il servizio per dati db
import {  ChartOptions } from 'chart.js';  // Import per i grafici
import { 
  BorderDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
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
import { Constructor } from '@genezio-sdk/f123dashboard';

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
    CardHeaderComponent,
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
  isLoading = true;

  // Variabili per la personalizzazione del radar chart
  private readonly CHART_TEXT_COLOR = 'rgba(130, 130, 130, 1)';
  private readonly CHART_TEXT_SIZE = 12;

  // Opzioni comuni per il radar chart
  radarChartOptions: any = {
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


  constructor(
    private dbData: DbDataService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      //richiesta di dati dal servizio
      this.piloti = this.dbData.getAllDrivers();
      this.constructors = this.dbData.getConstructors();

      // Calculate points for constructors based on drivers data
      this.calculateConstructorPoints();
      this.initializeRadarChartData();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Calculates all points types for each constructor based on their drivers' data
   */
  calculateConstructorPoints(): void {
    this.constructors.forEach(constructor => {
      // Find the drivers for this constructor
      const driver1 = this.piloti.find(p => p.driver_username === constructor.driver_1_username);
      const driver2 = this.piloti.find(p => p.driver_username === constructor.driver_2_username);

      if (driver1 && driver2) {
        // Calculate session points using parseInt to ensure we're working with numbers
        constructor.constructor_race_points = parseInt(driver1.total_race_points || '0') + parseInt(driver2.total_race_points || '0');
        constructor.constructor_full_race_points = parseInt(driver1.total_full_race_points || '0') + parseInt(driver2.total_full_race_points || '0');
        constructor.constructor_sprint_points = parseInt(driver1.total_sprint_points || '0') + parseInt(driver2.total_sprint_points || '0');
        constructor.constructor_qualifying_points = parseInt(driver1.total_qualifying_points || '0') + parseInt(driver2.total_qualifying_points || '0');
        constructor.constructor_free_practice_points = parseInt(driver1.total_free_practice_points || '0') + parseInt(driver2.total_free_practice_points || '0');
        
        // Assicuriamoci che constructor_tot_points sia anche un numero
        constructor.constructor_tot_points = parseInt(driver1.total_points || '0') + parseInt(driver2.total_points || '0');
      }
    });

    // Sort constructors by total points
    this.constructors.sort((a, b) => b.constructor_tot_points - a.constructor_tot_points);
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
