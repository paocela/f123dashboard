import { CommonModule } from '@angular/common'; // Importa CommonModule
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {DbDataService} from '../../service/db-data.service';  //aggiunto il servizio per dati db
import { ConstructorService } from '../../service/constructor.service';
import { ModalModule, ModalComponent } from '@coreui/angular';
import {
  AvatarComponent,
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
import type { Constructor, CumulativePointsData, DriverData, TrackData } from '@f123dashboard/shared';
import { PilotCardComponent } from '../../components/pilot-card/pilot-card.component';
import { ConstructorCardComponent } from '../../components/constructor-card/constructor-card.component';
import { CalendarComponent, CalendarEvent } from '../../components/calendar/calendar.component';

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


export interface DriverDataWithGainedPoints extends DriverData {
  gainedPoints: number;
  deltaPoints?: number;
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
    IconDirective,
    ReactiveFormsModule,
    CardHeaderComponent,
    TableDirective,
    AvatarComponent,
    ChampionshipTrendComponent,
    Tabs2Module,
    PilotCardComponent,
    ButtonCloseDirective,
    ConstructorCardComponent,
    CalendarComponent
]
})
export class DashboardComponent implements OnInit {
  private dbData = inject(DbDataService);
  private twitchApiService = inject(TwitchApiService);
  private sanitizer = inject(DomSanitizer);
  private constructorService = inject(ConstructorService);
  loadingService = inject(LoadingService);

  @ViewChild('championshipResoult', { static: true }) championshipResoult!: ModalComponent; 

  public screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  public twitchEmbedUrl: SafeResourceUrl = '' as SafeResourceUrl;
  calendarEvents: CalendarEvent[] = [];

  public showColumn(): boolean {
    return this.screenWidth > 1600;
  }

  public championship_standings_users: DriverDataWithGainedPoints[] = [];
  public championshipTracks: TrackData[] = [];
  public championshipNextTracks: TrackData[] = [];
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

  public allFlags: Record<string, string[]> = {
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
    if (this.isLive) {
          const currentHostname = window.location.hostname;
          const twitchUrl = `https://player.twitch.tv/?channel=${this.twitchApiService.getChannel()}&parent=${currentHostname}&autoplay=false&muted=false&time=0s`;
          this.twitchEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(twitchUrl);
    }
    this.championship_standings_users = this.dbData.getAllDrivers().map(driver => ({
      ...driver,
      gainedPoints: 0
    }));
    const championshipTrend: CumulativePointsData[] = this.dbData.getCumulativePoints().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.championshipTracks = this.dbData.getAllTracks();
    
    // Map tracks to calendar events
    this.calendarEvents = this.championshipTracks.map(track => {
      let desc = `Paese: ${track.country}`;
      if (track.has_sprint == 1) {desc += '\n• Sprint Race';}
      if (track.has_x2 == 1) {desc += '\n• Punti Doppi (x2)';}
      
      return {
        name: track.name,
        date: track.date, // Assuming track.date is a string ISO or Date object
        description: desc
      };
    });

    this.constructors =  this.dbData.getConstructors();
    
    // Calculate full constructor points based on total driver points
    this.constructors = this.constructorService.calculateConstructorPoints(this.constructors, this.championship_standings_users);
    
    // filter next championship track
    let i = 0;
    const currentDate: Date = new Date();
    currentDate.setHours(0, 0, 0, 0);
    this.championshipNextTracks = this.championshipTracks 
      .map(track => {
        const dbDate = new Date(track.date);
        dbDate.setHours(0, 0, 0, 0);
        return { ...track, date: dbDate, dbDate };
      })
      .filter(track => track.dbDate >= currentDate)
      .slice(0, 2)
      .map(track => ({
        ...track,
        date: track.dbDate.toLocaleDateString("it-CH")
      }));

    // Calculate delta points for the last 2 tracks
    for (const user of this.championship_standings_users) {
      const userTracks = championshipTrend.filter((track: CumulativePointsData) => track.driver_username === user.driver_username);
      if (userTracks.length > 2) {
        const lastPoints = userTracks[0].cumulative_points;
        const thirdToLastPoints = userTracks[2].cumulative_points;
        user.gainedPoints = lastPoints - thirdToLastPoints;
        this.showGainedPointsColumn = true;
      } else 
        {user.gainedPoints = 0;}
    }
    
    // Calculate gained points for constructors
    this.constructors = this.constructorService.calculateConstructorGainedPoints(this.constructors, this.championship_standings_users);

    //  delta points from the pilot above
    for (let i = 1; i < this.championship_standings_users.length; i++) 
      {this.championship_standings_users[i].deltaPoints = this.championship_standings_users[i - 1].total_points - this.championship_standings_users[i].total_points;}
    
    if ( championshipTrend.length > 3 * this.championship_standings_users.length) {
      // Get best driver and constructor of the week
      const lastRacePoints = championshipTrend.slice(0,this.championship_standings_users.length);
      const thirdLastRacePoints = championshipTrend.slice(2 * this.championship_standings_users.length,3 * this.championship_standings_users.length);

      const constructorsOfWeekTmp: ConstructorOfWeek[] = [];
      for (const constructor of this.constructors) {
        constructorsOfWeekTmp.push({ constructor_name: constructor.constructor_name,
                                      constructor_id: constructor.constructor_id,
                                      constructor_driver_1_id: constructor.driver_1_id,
                                      constructor_driver_2_id: constructor.driver_2_id,
                                      points: 0 });
      }
      

      let bestPoints = 0;
      let currentPoints = 0;

      for (i = 0; i < lastRacePoints.length; i++) {
        currentPoints = Number(lastRacePoints[i].cumulative_points) - Number(thirdLastRacePoints[i].cumulative_points);
        if ( currentPoints > bestPoints ) {
          bestPoints = currentPoints;
          this.driverOfWeek.driver_username = lastRacePoints[i].driver_username;
          this.driverOfWeek.driver_id = lastRacePoints[i].driver_id;
          this.driverOfWeek.points = currentPoints;
        } 

        constructorsOfWeekTmp.forEach(constructor => {
          if (constructor.constructor_driver_1_id == lastRacePoints[i].driver_id || constructor.constructor_driver_2_id == lastRacePoints[i].driver_id)  {
            constructor.points += currentPoints;
          }
          
        });
      }
      this.constructorOfWeek = constructorsOfWeekTmp.sort((a, b) => b.points - a.points)[0];
    }

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

  /**
   * Get constructor name for a driver by matching username
   */
  getConstructorForDriver(driverUsername: string): string {
    const constructor = this.constructors.find(
      c => c.driver_1_username === driverUsername || c.driver_2_username === driverUsername
    );
    return constructor?.constructor_name || '';
  }
}