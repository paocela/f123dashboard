import { Injectable } from '@angular/core';
import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  ScaleOptions} from 'chart.js';

import { getStyle } from '@coreui/utils';
import {DbDataService} from '../../service/db-data.service';  //aggiunto il servizio per dati db
import { CumulativePointsData } from '../../model/track';

export interface IChartProps {
  data?: ChartData;
  labels?: any;
  options?: ChartOptions;
  colors?: any;
  type: ChartType;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {
  constructor(private dbData: DbDataService) {
    this.initMainChart();
  }

  public mainChart: IChartProps = { type: 'line' };
  public championshipTrend: CumulativePointsData[] = [];
  public championshipTracks: any[] = [];

  private chartScale: number = 500;

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initMainChart(period: string = 'all', maxNumberOfRaces: number = 8) {

    this.championshipTrend = this.dbData.getCumulativePoints() ;
    this.championshipTracks = this.dbData.getAllTracks();
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    // mainChart
    this.mainChart['elements'] = period === 'Month' ? 12 : 27;
    
    // Dynamically initialize mainChart arrays for each driver found in championshipTrend
    const uniqueDrivers = [...new Set(this.championshipTrend.map(item => item.driver_username))];
    for (const driverUsername of uniqueDrivers) {
      this.mainChart[driverUsername] = [];
    }

    // Initialize arrays for all drivers found in the data
    for (let pippo of this.championshipTrend) {
      if (!this.mainChart[pippo.driver_username]) {
        this.mainChart[pippo.driver_username] = [];
      }
    }

    let labels: string[] = [];
    if (period === 'Month') {
      //se minore di 8 record prendi le piste da qui 
      if (labels.length < maxNumberOfRaces){
        labels = this.championshipTracks.slice(0, maxNumberOfRaces).map(track => track.country);
      }else {
        labels=this.championshipTracks
          .map(track => track.country)
          .slice(labels.length - maxNumberOfRaces, labels.length);
      }

      const driverData: { [key: string]: number[] } = {};

      for (let trendItem of this.championshipTrend) {
        if (!driverData[trendItem.driver_username]) {
          driverData[trendItem.driver_username] = [];
        }
        driverData[trendItem.driver_username].push(trendItem.cumulative_points);
      }
      let maxDriverValue = 0;
      for (let driver in driverData) {
        // Recupero ultimi maxNumberOfRaces risultati (o tutti se ce ne sono meno)
        const data = driverData[driver].slice(-maxNumberOfRaces);

        // Handle edge case: se abbiamo solo una gara o meno gare di maxNumberOfRaces
        let firstValue = 0;
        if (driverData[driver].length > maxNumberOfRaces) {
          // Se abbiamo più gare di maxNumberOfRaces, prendiamo il valore precedente al periodo
          firstValue = driverData[driver][(driverData[driver].length - maxNumberOfRaces) - 1];
        } else if (driverData[driver].length > 1) {
          // Se abbiamo almeno 2 gare ma meno di maxNumberOfRaces, prendiamo il primo valore
          firstValue = driverData[driver][0];
        }
        // Se abbiamo solo 1 gara, firstValue resta 0
        
        this.mainChart[driver] = data.map(value => value - firstValue);
        
        // Trova il valore massimo per ogni driver e aggiorna maxDriverValue se necessario
        const driverMax = Math.max(...data) - firstValue;
        if (driverMax > maxDriverValue) {
          maxDriverValue = driverMax;
        }
      }

      // Setta una variabile con il valore massimo arrotondato alle centinaia per eccesso
      this.chartScale = Math.ceil(maxDriverValue / 100) * 100;
      
    } else {
      /* tslint:disable:max-line-length */
      labels = this.championshipTracks.map(track => track.country);


      for (let pippo of this.championshipTrend ){
        this.mainChart[pippo.driver_username].push(pippo.cumulative_points)
      }

      // Trova il valore massimo in championshipTrend
      const maxTrendValue = Math.max(...this.championshipTrend.map(item => item.cumulative_points));
      // Arrotonda il valore massimo alle centinaia per eccesso
      this.chartScale = Math.ceil(maxTrendValue / 100) * 100;
    }

    const defaultColors = [
      '#8a2be2', '#32cd32', '#c0c0c0', '#f86c6b', '#ffa500', '#6495ed',
      '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'
    ];

    // Generate datasets dynamically based on championshipTrend driver_username data
    const datasets: ChartDataset[] = uniqueDrivers.map((driverUsername, index) => {
      const colorIndex = index % defaultColors.length;
      const color = defaultColors[colorIndex];
      
      return {
        data: this.mainChart[driverUsername] || [],
        label: driverUsername,
        backgroundColor: color,
        borderColor: color,
        pointHoverBackgroundColor: color,
        borderWidth: 2,
      };
    });


    const scales = this.getScales();
    const radius = screenWidth > 900 ? 900 : screenWidth;
    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        // TODO
      },
      scales,
      elements: {
        line: {
          tension: 0
        },
        point: {
          radius: radius / 350,
          hitRadius: radius / 200,
          hoverRadius:  radius / 250,
          hoverBorderWidth: radius / 300
        }
      }
    };

    this.mainChart.type = 'line';
    this.mainChart.options = options;
    this.mainChart.data = {
      datasets,
      labels
    };
  }

 
  getScales() {
    const colorBorderTranslucent = getStyle('--cui-border-color-translucent');
    const colorBody = getStyle('--cui-body-color');

    const scales: ScaleOptions<any> = {
      x: {
        grid: {
          color: colorBorderTranslucent,
          drawOnChartArea: false
        },
        ticks: {
          color: colorBody
        }
      },
      y: {
        border: {
          color: colorBorderTranslucent
        },
        grid: {
          color: colorBorderTranslucent
        },
        max: this.chartScale,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(this.chartScale / 5)
        }
      }
    };
    return scales;
  }
}
