import { Injectable } from '@angular/core';
import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  PluginOptionsByType,
  ScaleOptions,
  TooltipLabelStyle
} from 'chart.js';

import { DeepPartial } from 'chart.js/dist/types/utils';
import { getStyle, hexToRgba } from '@coreui/utils';
import {DbDataService} from 'src/app/service/db-data.service';  //aggiunto il servizio per dati db

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

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initMainChart(period: string = 'Month') {
    const brandSuccess = getStyle('--cui-success') ?? '#4dbd74';
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandInfoBg = hexToRgba(getStyle('--cui-info') ?? '#20a8d8', 10);
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    this.championshipTrend = this.dbData.getCumulativePoints() ;
    this.championshipTracks = this.dbData.getAllTracks();

    // mainChart
    this.mainChart['elements'] = period === 'Month' ? 12 : 27;
    this.mainChart['redmamba_99_'] = [];
    this.mainChart['FASTman'] = [];
    this.mainChart['HeavyButt'] = [];
    this.mainChart["Marcogang96"] = [];
    this.mainChart["GiannisCorbe"] = [];
    this.mainChart["Lil Mvrck"] = [];

    for (let pippo of this.championshipTrend ){
      this.mainChart[pippo.driver_username].push(pippo.cumulative_points)
    }

    let labels: string[] = [];
    if (period === 'Month') {
    
      labels = this.championshipTrend
      .filter(item => item.driver_username === 'FASTman') // Filtra i dati per un pilota
      .map(item => item.track_name); // Estrai track_name

      //se minore di 8 record prendi le piste da qui 
      if (labels.length<8){
        labels = this.championshipTracks.slice(0, 8).map(track => track.country);
      }
      else {
        labels=labels.slice(labels.length-8, labels.length)
      }

    } else {
      /* tslint:disable:max-line-length */
      labels = this.championshipTracks.map(track => track.country); ;
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

    const plugins: DeepPartial<PluginOptionsByType<any>> = {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          labelColor: (context) => ({ backgroundColor: context.dataset.borderColor } as TooltipLabelStyle)
        }
      }
    };

    const scales = this.getScales();

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
          radius: 3.5,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3
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
        max: 250,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5)
        }
      }
    };
    return scales;
  }
}
