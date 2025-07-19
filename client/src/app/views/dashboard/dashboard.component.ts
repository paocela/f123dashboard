import { formatDate, NgStyle } from '@angular/common';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { Component, DestroyRef, effect, inject, OnInit, Renderer2, signal, ViewChild, WritableSignal, DOCUMENT } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {DbDataService} from 'src/app/service/db-data.service';  //aggiunto il servizio per dati db
import { ChartOptions } from 'chart.js';
import { ModalModule, ModalComponent } from '@coreui/angular';
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
  TextColorDirective,
  BadgeComponent,
  CarouselComponent,
  CarouselControlComponent,
  CarouselIndicatorsComponent,
  CarouselInnerComponent,
  CarouselItemComponent,
  ThemeDirective
} from '@coreui/angular';
import { RouterLink } from '@angular/router';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { cilCalendar, cilMap, cilFire } from '@coreui/icons';
import { cifBh, cifAt, cifMc, cifJp, cifHu, cifCn, cifCa, cifEs, cifGb, cifBe, cifNl, cifAz, cifSg, cifIt, cifUs, cifAu, cifMx, cifBr, cifQa, cifAe, cifSa } from '@coreui/icons';
import { DatePipe } from '@angular/common';
import { LeaderboardComponent } from "../../components/leaderboard/leaderboard.component";
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { TwitchApiService } from '../../service/twitch-api.service';
import { BehaviorSubject } from 'rxjs';
import { LoadingService } from '../../service/loading.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

declare const Twitch: any;

interface ChampionshipStandings {
  username: string;
  car: string;
  pilot: string;
  championship: number;
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
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [
    LeaderboardComponent,
    ModalModule,
    BadgeComponent,
    ThemeDirective,
    CarouselComponent,
    CarouselIndicatorsComponent,
    CarouselInnerComponent,
    CarouselItemComponent,
    CarouselControlComponent,
    RouterLink,
    CommonModule,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    IconDirective,
    ReactiveFormsModule,
    ButtonGroupComponent,
    FormCheckLabelDirective,
    ChartjsComponent,
    NgStyle,
    CardFooterComponent,
    GutterDirective,
    CardHeaderComponent,
    TableDirective,
    AvatarComponent
]
})
export class DashboardComponent implements OnInit {
  @ViewChild('championshipResoult', { static: true }) championshipResoult!: ModalComponent;

  constructor(
    private dbData: DbDataService,
    private twitchApiService: TwitchApiService,
    public loadingService: LoadingService
  ) {
    
  } 

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #renderer: Renderer2 = inject(Renderer2);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);
  public screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  public showColumn(): boolean {
    return this.screenWidth > 1600 || this.screenWidth < 768;
  }

  public championship_standings_users: any[] = [];
  public championshipTrend: any[] = [];
  public championshipTracks: any[] = [];
  public championshipNextTracks: any[] = [];
  public isLive: boolean = true;

  public allFlags: {[key: string]: any} = {
    "Bahrain": cifBh,
    "Arabia Saudita": cifSa,
    "Australia": cifAu,
    "Giappone": cifJp,
    "Cina": cifCn,
    "USA": cifUs,
    "Monaco": cifMc,
    "Canada": cifCa,
    "Spagna": cifEs,
    "Austria": cifAt,
    "UK": cifGb,
    "Ungheria": cifHu,
    "Belgio": cifBe,
    "Olanda": cifNl,
    "Italia": cifIt,
    "Azerbaijan": cifAz,
    "Singapore": cifSg,
    "Messico": cifMx,
    "Brasile": cifBr,
    "Qatar": cifQa,
    "Emirati Arabi Uniti": cifAe,
  };

  public calendarIcon: string[] = cilCalendar;
  public mapIcon: string[] = cilMap;
  public fireIcon: string[] = cilFire;

  public mainChart: IChartProps = { type: 'line' };
  public mainChartRef: WritableSignal<any> = signal(undefined);
  #mainChartRefEffect = effect(() => {
    if (this.mainChartRef()) {
      this.setChartStyles();
    }
  });
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new FormGroup({
    trafficRadio: new FormControl('Year')
  });

  // 0 = hidden, 1 = modal piloti, 2 = modal fanta
  public resoultModalVisible = 0;
  toggleResoultModalvisible(modal: number) {
    this.resoultModalVisible = modal;
  }

  public isLive$ = new BehaviorSubject<boolean>(false);
  public streamTitle$ = new BehaviorSubject<string>('');

  ngOnInit(): void {
    //richiesta dati al db
    this.isLive = this.twitchApiService.isLive();
    this.championship_standings_users = this.dbData.getAllDrivers() ;
    this.championshipTrend = this.dbData.getCumulativePoints() ;
    this.championshipTracks = this.dbData.getAllTracks();

    // filter next championship track
    var i = 0;
    const current_date: Date = new Date();
    current_date.setHours(0, 0, 0, 0);
    for (let track of this.championshipTracks){
      const db_date: Date = new Date(track.date);
      db_date.setHours(0, 0, 0, 0);
      if ( db_date >= current_date )
      {
        this.championshipNextTracks[i] = track;
        this.championshipNextTracks[i]["date"] = db_date.toLocaleDateString("it-CH");
        i++;
        if (i == 2) break;
      }
    }

    // Calculate delta points for the last 2 tracks
    for (let user of this.championship_standings_users) {
      const userTracks = this.championshipTrend.filter(track => track.driver_username === user.driver_username);
      if (userTracks.length >= 3) {
        const lastPoints = userTracks[userTracks.length - 1].cumulative_points;
        const thirdToLastPoints = userTracks[userTracks.length - 3].cumulative_points;
        user.gainedPoints = lastPoints - thirdToLastPoints;
      } else {
        user.gainedPoints = '-';
      }
    }

    //  delta points from the pilot above
    for (let i = 1; i < this.championship_standings_users.length; i++) {
      this.championship_standings_users[i].deltaPoints = this.championship_standings_users[i - 1].total_points - this.championship_standings_users[i].total_points;
    }

    this.setTrafficPeriod('Year', 0);
    this.updateChartOnColorModeChange();
  }

  initCharts(): void {
    this.mainChart = this.#chartsData.mainChart;
  }

  setTrafficPeriod(value: string, numberOfRaces: number): void {
    this.#chartsData.initMainChart(value, numberOfRaces); // Pass numberOfRaces
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
