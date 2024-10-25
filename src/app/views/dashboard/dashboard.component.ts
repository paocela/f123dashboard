import { DOCUMENT, NgStyle } from '@angular/common';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { Component, DestroyRef, effect, inject, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  GutterDirective,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TextColorDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { cifMc, cifSg, cifIt, cifUs, cilCalendar, cilMap } from '@coreui/icons';

import { WidgetsBrandComponent } from '../widgets/widgets-brand/widgets-brand.component';
import { WidgetsDropdownComponent } from '../widgets/widgets-dropdown/widgets-dropdown.component';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';

interface ChampionshipStandings {
  username: string;
  car: string;
  pilot: string;
  points: number;
  position: number
  lastwin: string;
  avatar: string;
  color: string;
}

interface NextTrack {
  name: string;
  date: string;
  flag: string[];
  length: number;
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule,WidgetsDropdownComponent, TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, ButtonDirective, IconDirective, ReactiveFormsModule, ButtonGroupComponent, FormCheckLabelDirective, ChartjsComponent, NgStyle, CardFooterComponent, GutterDirective, ProgressBarDirective, ProgressComponent, WidgetsBrandComponent, CardHeaderComponent, TableDirective, AvatarComponent]
})
export class DashboardComponent implements OnInit {

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #renderer: Renderer2 = inject(Renderer2);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);

  public championship_standings_users: ChampionshipStandings[] = [
    {
      username: 'redmamba_99_',
      car: './assets/images/constructors/alpine.svg',
      pilot: 'Gasly',
      points: 500,
      position: 1,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/1.jpg',
      color: 'success',
    },
    {
      username: 'GiannisCorbe',
      car: './assets/images/constructors/haas.svg',
      pilot: 'Magnussen',
      points: 400,
      position: 2,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/2.jpg',
      color: 'danger',
    },
    {
      username: 'HeavyButt',
      car: './assets/images/constructors/mercedes.svg',
      pilot: 'Warning ',
      points: 300,
      position: 3,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/3.jpg',
      color: 'info',
    },
    {
      username: 'Marcogang97',
      car: './assets/images/constructors/ferrari.svg',
      pilot: 'Leclerc',
      points: 200,
      position: 4,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/4.jpg',
      color: 'secondary',
    },
    {
      username: 'FASTman',
      car: './assets/images/constructors/redbull.svg',
      pilot: 'Verstappen',
      points: 100,
      position: 5,
      lastwin: '16/10/2024',
      avatar: './assets/images/avatars/5.jpg',
      color: 'primary',
    },
  ];

  public next_track: NextTrack = {
    name: "Monaco",
    date: '12/01/2024',
    flag: cifMc,
    length: 4.36,
  }

  public calendarIcon: string[] = cilCalendar;
  public mapIcon: string[] = cilMap;

  public mainChart: IChartProps = { type: 'line' };
  public mainChartRef: WritableSignal<any> = signal(undefined);
  #mainChartRefEffect = effect(() => {
    if (this.mainChartRef()) {
      this.setChartStyles();
    }
  });
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new FormGroup({
    trafficRadio: new FormControl('Month')
  });

  ngOnInit(): void {
    this.initCharts();
    this.updateChartOnColorModeChange();
  }

  initCharts(): void {
    this.mainChart = this.#chartsData.mainChart;
  }

  setTrafficPeriod(value: string): void {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.#chartsData.initMainChart(value);
    this.initCharts();
  }

  handleChartRef($chartRef: any) {
    if ($chartRef) {
      this.mainChartRef.set($chartRef);
    }
  }

  updateChartOnColorModeChange() {
    const unListen = this.#renderer.listen(this.#document.documentElement, 'ColorSchemeChange', () => {
      this.setChartStyles();
    });

    this.#destroyRef.onDestroy(() => {
      unListen();
    });
  }

  setChartStyles() {
    if (this.mainChartRef()) {
      setTimeout(() => {
        const options: ChartOptions = { ...this.mainChart.options };
        const scales = this.#chartsData.getScales();
        this.mainChartRef().options.scales = { ...options.scales, ...scales };
        this.mainChartRef().update();
      });
    }
  }
}
