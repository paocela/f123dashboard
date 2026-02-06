import { Component, AfterViewInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { GridModule, TableDirective, AvatarComponent, AlertComponent, ColorModeService } from '@coreui/angular';
import { cilPeople, cilWarning } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { PlaygroundService, PlaygroundBestScore } from '../../service/playground.service';
import type { User } from '@f123dashboard/shared';
import { AuthService } from 'src/app/service/auth.service';


@Component({
  selector: 'app-playground',
  imports: [
    GridModule,
    TableDirective,
    IconDirective,
    AvatarComponent,
    AlertComponent,
    DatePipe,
    CommonModule
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaygroundComponent implements AfterViewInit {

  playgroundService = inject(PlaygroundService);
  private authService = inject(AuthService);
  readonly #colorModeService = inject(ColorModeService);


  public screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  playgroundLeaederboard: PlaygroundBestScore[] = [];

  currentUser: User | null = null;
  isLoggedIn = false;

  public cilPeople: string[] = cilPeople;
  public cilWarning: string[] = cilWarning;

  bulbs_up: NodeListOf<HTMLElement> | null = null;
  bulbs: NodeListOf<HTMLElement> | null = null;
  timerStarted: boolean = false;
  lightsTriggeredFlag: boolean = false;
  lightsErrorFlag: boolean = false;
  timerStartTime: number | null = null;
  playerStatus: string = "";
  playerStatusColor: string = "";  
  playerScore: number | null = null;
  playerBestScore: number = 9999;
  jumpStartFlag: boolean = false;

  ngOnInit(): void {
    this.playgroundLeaederboard = this.playgroundService.getPlaygroundLeaderboard();

    // Check if user is already logged in
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        const user = this.authService.getCurrentUser();
        this.currentUser = user;
        this.isLoggedIn = true;
      }
    });

    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });

    // set best score for current user
    if ( this.isLoggedIn ) {
      this.playerBestScore = this.playgroundService.getUserBestScore(this.currentUser?.id ?? 0);
    }

    this.resetGameText();
  }


  ngAfterViewInit(): void {
    this.bulbs_up = document.querySelectorAll<HTMLElement>('.bulb_up');
    this.bulbs = document.querySelectorAll<HTMLElement>('.bulb');
  }

  showColumn(): boolean {
    return this.screenWidth > 1600;
  }

  gameTrigger(): void {
    const bulbs = this.bulbs ?? document.querySelectorAll<HTMLElement>('.bulb');
    
    if ( this.timerStarted ) {
      // Record reaction time and game over
      const elapsedTime = Date.now() - (this.timerStartTime ?? 0);
      this.playerScore = elapsedTime;
      this.playerStatus = `Tempo di reazione: ${this.playerScore} ms`;
      this.playerStatusColor = "#0E8F5F"

      this.timerStarted = false;
      this.timerStartTime = null;
      this.lightsTriggeredFlag = false;
      
      if ( this.playerScore < this.playerBestScore ) {
        this.playerBestScore = this.playerScore;
        if ( this.isLoggedIn && this.currentUser?.id ) {
          // update DB with new best score
          const newBestScore: PlaygroundBestScore = {
            user_id: this.currentUser?.id ?? 0,
            username: this.currentUser?.username ?? "",
            image: this.currentUser?.image ?? "",
            best_score: this.playerBestScore,
            best_date: new Date(),
          };
          this.playgroundService.setUserBestScore(newBestScore);

          // update local leaderboard
          let tmp: PlaygroundBestScore[] = this.playgroundLeaederboard;
          let found = tmp.find(best_score => best_score.user_id === this.currentUser?.id);
          if ( !found ) {
            // New entry
            tmp.push(newBestScore);
          } else {
            tmp.find(best_score => best_score.user_id === this.currentUser?.id)!.best_score = this.playerBestScore;
          }
          this.playgroundLeaederboard = [];
          this.playgroundLeaederboard = tmp;
        }
      }
    } else {
      if ( !this.lightsErrorFlag ) {
        if ( this.lightsTriggeredFlag ) {
          // Jump start condition
          this.playerStatus = `FALSA PARTENZA`;
          this.playerStatusColor = "#FF0000";
          this.lightsTriggeredFlag = false; 
          this.jumpStartFlag = true;
          this.lightsError();
        } else {
          // Start light up sequence
          this.resetGameText();

          this.lightsTriggeredFlag = true;
          this.lightsUp();
        }
      }
    }
  }

  async lightsUp(): Promise<void> {
    const bulbs = this.bulbs ?? document.querySelectorAll<HTMLElement>('.bulb');

    for (let idx = 0; idx < bulbs.length && !this.jumpStartFlag; idx++) {
      bulbs[idx].classList.add('red_light');
      await sleep(1000);
    }

    if ( !this.jumpStartFlag ) {
      const maxRandomDelay = 4000; 
      const minRandomDelay = 500;
      const randomDelay = Math.floor(Math.random() * (maxRandomDelay - minRandomDelay + 1)) + minRandomDelay;
      await sleep(randomDelay);
    }

    if ( !this.jumpStartFlag ) {
      this.lightsOut()
    }

    this.jumpStartFlag = false; 
  }

  lightsOut(): void {
    const bulbs = this.bulbs ?? document.querySelectorAll<HTMLElement>('.bulb');

    for (let idx = 0; idx < bulbs.length; idx++) {
      bulbs[idx].classList.remove('red_light');
    }

    this.timerStarted = true;
    this.timerStartTime = Date.now();
  }

  async lightsError(): Promise<void> {
    const bulbs = this.bulbs ?? document.querySelectorAll<HTMLElement>('.bulb');

    this.lightsErrorFlag = true;

    for (let i = 0; i < 3; i++) {
      for (let idx = 0; idx < bulbs.length; idx++) {
        bulbs[idx].classList.add('red_light');
      }

      await sleep(500);

      for (let idx = 0; idx < bulbs.length; idx++) {
        bulbs[idx].classList.remove('red_light');
      }

      await sleep(500);
    }

    this.resetGameText();

    this.lightsErrorFlag = false;
  }

  getAvatar(userId: number, image?: string): string {
    if (image) 
      {return `data:image/jpeg;base64,${image}`;}
    
    // Fallback to file path
    return `./assets/images/avatars_fanta/${userId}.png`;
  }

  resetGameText(): void {
    this.playerStatus = `SEI PRONTO?`;
    if ( this.#colorModeService.colorMode.name == 'dark' ) {
      this.playerStatusColor = "#FFFFFF";
    } else {
      this.playerStatusColor = "#000000"; 
    }
  }


}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
