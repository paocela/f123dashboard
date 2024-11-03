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
  constructor() {
    this.initMainChart();
  }

  public mainChart: IChartProps = { type: 'line' };

  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initMainChart(period: string = 'Month') {
    const brandSuccess = getStyle('--cui-success') ?? '#4dbd74';
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandInfoBg = hexToRgba(getStyle('--cui-info') ?? '#20a8d8', 10);
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    // mainChart
    this.mainChart['elements'] = period === 'Month' ? 12 : 27;
    this.mainChart['redmamba_99_'] = [];
    this.mainChart['FASTman'] = [];
    this.mainChart['HeavyButt'] = [];

    // generate random values for mainChart
    for (let i = 0; i <= this.mainChart['elements']; i++) {
      this.mainChart['redmamba_99_'].push(this.random(50, 240));
      this.mainChart['FASTman'].push(this.random(20, 160));
      this.mainChart['HeavyButt'].push(this.random(20, 200));
    }

    let labels: string[] = [];
    if (period === 'Month') {
      labels = [
        'Br',
        'Us',
        'Es',
        'Pl',
        'Pl',
        'Pl',
        'Pl',
        'Pl',
      ];
    } else {
      /* tslint:disable:max-line-length */
      const week = [
        'Pl',
        'Es',
        'Us',
        'Pl',
        'Br',
      ];
      labels = week.concat(week, week, week);
    }

    const colors = [
      {
        // Colore brandInfo
        backgroundColor: brandInfo,
        borderColor: brandInfo,
        pointHoverBackgroundColor: brandInfo,
        borderWidth: 2,
      },
      {
        // Colore brandSuccess
        backgroundColor: brandSuccess,
        borderColor: brandSuccess || '#4dbd74',
        pointHoverBackgroundColor: '#fff'
      },
      {
        // Colore brandDanger
        backgroundColor: brandDanger,
        borderColor: brandDanger || '#f86c6b',
        pointHoverBackgroundColor: brandDanger,
      }
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
