import { Component, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { GridModule, TableDirective } from '@coreui/angular';
import { cilPeople } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';


@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    GridModule,
    TableDirective,
    IconDirective
  ],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaygroundComponent implements AfterViewInit {

  public cilPeople: string[] = cilPeople;

  bulbs_up: NodeListOf<HTMLElement> | null = null;
  bulbs: NodeListOf<HTMLElement> | null = null;
  timerStarted: boolean = false;
  lightsTriggeredFlag: boolean = false;
  lightsErrorFlag: boolean = false;
  timerStartTime: number | null = null;
  playerStatus: string = "SEI PRONTO?";
  playerStatusColor: string = "#FFFFFF";  
  playerScore: number | null = null;
  playerBestScore: number = 9999;
  jumpStartFlag: boolean = false;

  ngAfterViewInit(): void {
    this.bulbs_up = document.querySelectorAll<HTMLElement>('.bulb_up');
    this.bulbs = document.querySelectorAll<HTMLElement>('.bulb');
  }

  gameTrigger(): void {
    const bulbs = this.bulbs ?? document.querySelectorAll<HTMLElement>('.bulb');
    
    if ( this.timerStarted ) {
      // Record reaction time and game over
      const elapsedTime = Date.now() - (this.timerStartTime ?? 0);
      this.playerScore = elapsedTime;
      this.playerStatus = `Tempo di reazione: ${this.playerScore} ms`;
      this.playerStatusColor = "#0E8F5F"
      
      if ( this.playerScore < this.playerBestScore ) {
        this.playerBestScore = this.playerScore;
      }

      this.timerStarted = false;
      this.timerStartTime = null;
      this.lightsTriggeredFlag = false;
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

    this.playerStatus = `SEI PRONTO?`;
    this.playerStatusColor = "#FFFFFF";

    this.lightsErrorFlag = false;
  }

}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
