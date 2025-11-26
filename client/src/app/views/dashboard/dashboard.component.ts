import { CommonModule } from '@angular/common'; // Importa CommonModule
import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
  Tabs2Module,
  ButtonCloseDirective
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
import type { Constructor, DriverData } from '@f123dashboard/shared';
import { PilotCardComponent } from '../../components/pilot-card/pilot-card.component';
import { ConstructorCardComponent } from '../../components/constructor-card/constructor-card.component';

export interface DriverOfWeek {
  driver_username: string;
  driver_id: number;
  points: number;
}

export interface ConstructorOfWeek {
  constructor_name: string;
  constructor_id: number;
  constructor_driver_1_id: number;
  constructor_driver_2_id: number;
  points: number;
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
    CardHeaderComponent,
    TableDirective,
    AvatarComponent,
    ChampionshipTrendComponent,
    Tabs2Module,
    PilotCardComponent,
    ButtonCloseDirective,
    ConstructorCardComponent
]
})
export class DashboardComponent implements OnInit {
  private dbData = inject(DbDataService);
  private twitchApiService = inject(TwitchApiService);
  loadingService = inject(LoadingService);

  @ViewChild('championshipResoult', { static: true }) championshipResoult!: ModalComponent; 

  public screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  public showColumn(): boolean {
    return this.screenWidth > 1600;
  }

  public championship_standings_users: any[] = [];
  public championshipTracks: any[] = [];
  public championshipNextTracks: any[] = [];
  public isLive = true;
  public constructors: Constructor[] = [];
  public showGainedPointsColumn = false;
  public driverOfWeek: DriverOfWeek = { driver_username: '', driver_id: 0, points: 0 };
  public constructorOfWeek: ConstructorOfWeek = { constructor_name: '', 
                                                  constructor_id: 0,
                                                  constructor_driver_1_id: 0, 
                                                  constructor_driver_2_id: 0, 
                                                  points: 0 };

  // Pilot modal
  public pilotModalVisible = false;
  public selectedPilot: DriverData | null = null;
  public selectedPilotPosition = 0;

  // Constructor modal
  public constructorModalVisible = false;
  public selectedConstructor: Constructor | null = null;
  public selectedConstructorPosition = 0;

  public allFlags: Record<string, any> = {
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

  ngOnInit(){
    //richiesta dati al db
    this.isLive = this.twitchApiService.isLive();
    this.championship_standings_users = this.dbData.getAllDrivers();
    const championshipTrend = this.dbData.getCumulativePoints();
    this.championshipTracks = this.dbData.getAllTracks();
    this.constructors =  this.dbData.getConstructors();

    // filter next championship track
    let i = 0;
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
    for (const user of this.championship_standings_users) {
      const userTracks = championshipTrend.filter((track: any) => track.driver_username === user.driver_username);
      if (userTracks.length >= 3) {
        const lastPoints = userTracks[userTracks.length - 1].cumulative_points;
        const thirdToLastPoints = userTracks[userTracks.length - 3].cumulative_points;
        user.gainedPoints = lastPoints - thirdToLastPoints;
        this.showGainedPointsColumn = true;
      } else 
        {user.gainedPoints = 0;}
      
    }

    //  delta points from the pilot above
    for (let i = 1; i < this.championship_standings_users.length; i++) 
      {this.championship_standings_users[i].deltaPoints = this.championship_standings_users[i - 1].total_points - this.championship_standings_users[i].total_points;}
    

    // Get best driver and constructor of the week
    const sortedCumulativePoints = championshipTrend.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const lastRacePoints = sortedCumulativePoints.slice(0, this.championship_standings_users.length);

    const constructorsOfWeek_tmp: ConstructorOfWeek[] = [];
    for (const constructor of this.constructors) 
      {constructorsOfWeek_tmp.push({ constructor_name: constructor.constructor_name,
                                    constructor_id: constructor.constructor_id,
                                    constructor_driver_1_id: constructor.driver_1_id,
                                    constructor_driver_2_id: constructor.driver_2_id,
                                    points: 0 });}
    

    let bestPoints = 0;
    let currentPoints = 0;

    for (i = 0; i < lastRacePoints.length; i++) {
      currentPoints = Number(lastRacePoints[i].cumulative_points);
      if ( currentPoints > bestPoints ) {
        bestPoints = currentPoints;
        this.driverOfWeek.driver_username = lastRacePoints[i].driver_username;
        this.driverOfWeek.driver_id = lastRacePoints[i].driver_id;
        this.driverOfWeek.points = currentPoints;
      } 

      constructorsOfWeek_tmp.forEach(constructor => {
        if (constructor.constructor_driver_1_id == lastRacePoints[i].driver_id || constructor.constructor_driver_2_id == lastRacePoints[i].driver_id)  {
          constructor.points += currentPoints;
        }
        
      });
    }
    this.constructorOfWeek = constructorsOfWeek_tmp.sort((a, b) => b.points - a.points)[0];
  }

  /**
   * Opens the pilot modal with the selected pilot data
   */
  openPilotModal(pilot: DriverData, position: number): void {
    this.selectedPilot = pilot;
    this.selectedPilotPosition = position;
    this.pilotModalVisible = true;
  }

  /**
   * Closes the pilot modal
   */
  closePilotModal(): void {
    this.pilotModalVisible = false;
    this.selectedPilot = null;
    this.selectedPilotPosition = 0;
  }

  /**
   * Opens the constructor modal with the selected constructor data
   */
  openConstructorModal(constructor: Constructor, position: number): void {
    this.selectedConstructor = constructor;
    this.selectedConstructorPosition = position;
    this.constructorModalVisible = true;
  }

  /**
   * Closes the constructor modal
   */
  closeConstructorModal(): void {
    this.constructorModalVisible = false;
    this.selectedConstructor = null;
    this.selectedConstructorPosition = 0;
  }
}