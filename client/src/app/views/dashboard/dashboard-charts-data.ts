import { Injectable } from '@angular/core';
import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  ScaleOptions} from 'chart.js';

import { getStyle } from '@coreui/utils';
import {DbDataService} from '../../service/db-data.service';  //aggiunto il servizio per dati db

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
  public championshipTrend: any[] = [];
  public championshipTracks: any[] = [];

  private chartScale: number = 500;

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initMainChart(period: string = 'all', numberOfRaces: number = 8) {

    this.championshipTrend = this.dbData.getCumulativePoints() ;
    this.championshipTracks = this.dbData.getAllTracks();
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    // mainChart
    this.mainChart['elements'] = period === 'Month' ? 12 : 27;
    this.mainChart['redmamba_99_'] = [];
    this.mainChart['FASTman'] = [];
    this.mainChart['HeavyButt'] = [];
    this.mainChart["Marcogang96"] = [];
    this.mainChart["GiannisCorbe"] = [];
    this.mainChart["Lil Mvrck"] = [];

    let labels: string[] = [];
    if (period === 'Month') {
      //se minore di 8 record prendi le piste da qui 
      if (labels.length < numberOfRaces){
        labels = this.championshipTracks.slice(0, numberOfRaces).map(track => track.country);
      }else {
        labels=this.championshipTracks
          .map(track => track.country)
          .slice(labels.length - numberOfRaces, labels.length);
      }

      const driverData: { [key: string]: number[] } = {};

      for (let pippo of this.championshipTrend) {
        if (!driverData[pippo.driver_username]) {
          driverData[pippo.driver_username] = [];
        }
        driverData[pippo.driver_username].push(pippo.cumulative_points);
      }
      let maxDriverValue = 0;
      for (let driver in driverData) {
        // Recupero ultimi 8 risultati
        const data = driverData[driver].slice(-numberOfRaces);
        // Sottraggo il primo valore a tutti gli altri per avere un grafico che parte da gara -1
        const firstValue = driverData[driver][(driverData[driver].length - numberOfRaces) - 1]; 
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

      // Initialize arrays for all drivers found in the data
      for (let pippo of this.championshipTrend) {
        if (!this.mainChart[pippo.driver_username]) {
          this.mainChart[pippo.driver_username] = [];
        }
      }

      for (let pippo of this.championshipTrend ){
        this.mainChart[pippo.driver_username].push(pippo.cumulative_points)
      }

      // Trova il valore massimo in championshipTrend
      const maxTrendValue = Math.max(...this.championshipTrend.map(item => item.cumulative_points));
      // Arrotonda il valore massimo alle centinaia per eccesso
      this.chartScale = Math.ceil(maxTrendValue / 100) * 100;
    }

    const colors = [
      {
        // Colore redmamba_99_
        backgroundColor: '#8a2be2',
        borderColor: '#8a2be2',
        pointHoverBackgroundColor: '#8a2be2',
        borderWidth: 2,
      },
      {
        // Colore FASTman
        backgroundColor: '#32cd32',
        borderColor: '#32cd32',
        pointHoverBackgroundColor: '#fff',
        borderWidth: 2,
      },
      {
        // Colore HeavyButt
        backgroundColor: '#c0c0c0',
        borderColor: '#c0c0c0',
        pointHoverBackgroundColor: '#fff',
        borderWidth: 2,
      },
      {
        // Colore Marcogang96
        backgroundColor: '#f86c6b',
        borderColor: '#f86c6b',
        pointHoverBackgroundColor: '#f86c6b',
        borderWidth: 2,
      },
      {
        // Colore GiannisCorbe
        backgroundColor: '#ffa500',
        borderColor: '#ffa500',
        pointHoverBackgroundColor: '#fff',
        borderWidth: 2,
      },
      {
        // Colore Lil Mvrck
        backgroundColor: '#6495ed',
        borderColor: '#6495ed',
        pointHoverBackgroundColor: '#fff',
        borderWidth: 2,
      },
    ];

    const datasets: ChartDataset[] = [
      {
        data: this.mainChart['redmamba_99_'],
        label: 'redmamba_99_',
        ...colors[0]
      },
      {
        data: this.mainChart['FASTman'],
        label: 'FASTman',
        ...colors[1]
      },
      {
        data: this.mainChart['HeavyButt'],
        label: 'HeavyButt',
        ...colors[2]
      },
      {
        data: this.mainChart['Marcogang96'],
        label: 'Marcogang96',
        ...colors[3]
      },
      {
        data: this.mainChart['GiannisCorbe'],
        label: 'GiannisCorbe',
        ...colors[4]
      },
      {
        data: this.mainChart['Lil Mvrck'],
        label: 'Lil Mvrck',
        ...colors[5]
      }
    ];


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
