import { Injectable } from '@angular/core';
import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  PluginOptionsByType,
  ScaleOptions,
  TooltipLabelStyle,
  Chart
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
    // Modifica 1: Registra un plugin per disegnare le immagini.
    Chart.register({
      id: 'customLabelImagesPlugin',
      afterDraw: (chart: Chart) => {
        const ctx = chart.ctx;
        const xAxis = chart.scales['x']; // Otteniamo l'asse X

        // Modifica 2: Controllo che ci siano tick e immagini. Se mancano, interrompiamo la funzione.
        if (!xAxis.ticks || !this.images) {
          return;
        }

        // Modifica 3: Iteriamo su ciascun tick dell'asse X e disegniamo l'immagine corrispondente
        xAxis.ticks.forEach((_, index: number) => {
          const img = this.images[index];
          if (img) {
            const imgWidth = 30; // Modifica 7: Definiamo larghezza fissa per l'immagine
            const imgHeight = 30; // Modifica 7: Definiamo altezza fissa per l'immagine
            const xPos = xAxis.getPixelForTick(index) - (imgWidth / 2); // Centriamo l'immagine
            const yPos = chart.height - imgHeight - 10; // Modifica 6: Ridimensioniamo la posizione verticale per evitare sovrapposizioni

            // Disegniamo l'immagine ridimensionata
            ctx.drawImage(img, xPos, yPos, imgWidth, imgHeight);
          }
        });
      }
    });

    // Inizializza il grafico principale
    this.initMainChart();
  }

  public mainChart: IChartProps = { type: 'line' };
  private images: HTMLImageElement[] = []; // Memorizza le immagini da visualizzare

  // Funzione per generare un numero casuale
  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Inizializza i dati e le opzioni del grafico
  initMainChart(period: string = 'Month') {
    const brandSuccess = getStyle('--cui-success') ?? '#4dbd74';
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    this.mainChart['elements'] = period === 'Month' ? 12 : 27;
    this.mainChart['redmamba_99_'] = [];
    this.mainChart['FASTman'] = [];
    this.mainChart['HeavyButt'] = [];

    // Generiamo i dati casuali per i dataset del grafico
    for (let i = 0; i <= this.mainChart['elements']; i++) {
      this.mainChart['redmamba_99_'].push(this.random(50, 240));
      this.mainChart['FASTman'].push(this.random(20, 160));
      this.mainChart['HeavyButt'].push(this.random(20, 200));
    }

    // Modifica 4: Definiamo i percorsi per le immagini che vogliamo visualizzare sull'asse X
    const imageSources = [
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg',
      './assets/images/constructors/ferrari.svg'
      // Aggiungi altre immagini se necessario
    ];

    // Carichiamo le immagini in un array
    this.images = imageSources.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

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
      plugins,
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

  // Definiamo le opzioni per le scale del grafico
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
          color: colorBody,
          // Modifica 5: Nascondiamo le etichette testuali per lasciare spazio alle immagini
          callback: () => {
            return ''; // Lascia vuote le etichette per visualizzare solo le immagini
          }
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
