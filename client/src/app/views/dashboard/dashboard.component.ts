import { CommonModule } from '@angular/common'; // Importa CommonModule
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {DbDataService} from '../../service/db-data.service';  //aggiunto il servizio per dati db
import { ModalModule, ModalComponent } from '@coreui/angular';
import {
  AvatarComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  BadgeComponent,
  CarouselComponent,
  CarouselControlComponent,
  CarouselIndicatorsComponent,
  CarouselInnerComponent,
  CarouselItemComponent,
  ThemeDirective,
  Tabs2Module
} from '@coreui/angular';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { cilCalendar, cilMap, cilFire } from '@coreui/icons';
import { cifBh, cifAt, cifMc, cifJp, cifHu, cifCn, cifCa, cifEs, cifGb, cifBe, cifNl, cifAz, cifSg, cifIt, cifUs, cifAu, cifMx, cifBr, cifQa, cifAe, cifSa } from '@coreui/icons';
import { LeaderboardComponent } from "../../components/leaderboard/leaderboard.component";
import { TwitchApiService } from '../../service/twitch-api.service';
import { BehaviorSubject } from 'rxjs';
import { LoadingService } from '../../service/loading.service';
import { ChampionshipTrendComponent } from '../../components/championship-trend/championship-trend.component';
import { Constructor } from '../../model/constructor';

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
    CardHeaderComponent,
    TableDirective,
    AvatarComponent,
    ChampionshipTrendComponent,
    Tabs2Module
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

  public screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  public showColumn(): boolean {
    return this.screenWidth > 1600 || this.screenWidth < 768;
  }

  public championship_standings_users: any[] = [];
  public championshipTracks: any[] = [];
  public championshipNextTracks: any[] = [];
  public isLive: boolean = true;
  public constructors: Constructor[] = [];

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

  // 0 = hidden, 1 = modal piloti, 2 = modal fanta
  public resoultModalVisible = 0;
  toggleResoultModalvisible(modal: number) {
    this.resoultModalVisible = modal;
  }

  public isLive$ = new BehaviorSubject<boolean>(false);
  public streamTitle$ = new BehaviorSubject<string>('');

  async ngOnInit(): Promise<void> {
    //richiesta dati al db
    this.isLive = this.twitchApiService.isLive();
    this.championship_standings_users = this.dbData.getAllDrivers() ;
    const championshipTrend = this.dbData.getCumulativePoints() ;
    this.championshipTracks = this.dbData.getAllTracks();
    this.constructors = await this.dbData.getConstructors(1);

    // filter next championship track
    var i = 0;
    const current_date: Date = new Date();
    current_date.setHours(0, 0, 0, 0);
    this.championshipNextTracks = this.championshipTracks
      .map(track => {
        const db_date = new Date(track.date);
        db_date.setHours(0, 0, 0, 0);
        return { ...track, date: db_date, db_date };
      })
      .filter(track => track.db_date >= current_date)
      .slice(0, 2)
      .map(track => ({
        ...track,
        date: track.db_date.toLocaleDateString("it-CH")
      }));
    // Calculate delta points for the last 2 tracks
    for (let user of this.championship_standings_users) {
      const userTracks = championshipTrend.filter((track: any) => track.driver_username === user.driver_username);
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
  }
}