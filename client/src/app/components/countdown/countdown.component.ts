import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import {
  CardBodyComponent,
  CardComponent} from '@coreui/angular';
import {DbDataService} from 'src/app/service/db-data.service';  //aggiunto il servizio per dati db

interface timeInterface {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
    selector: 'countdown-component',
    imports: [
        CommonModule,
        CardComponent, CardBodyComponent
    ],
    templateUrl: './countdown.component.html',
    styleUrl: './countdown.component.scss'
})
export class CountdownComponent implements OnInit, OnDestroy {
  private dbData = inject(DbDataService);


  public championshipNextTracks: any[] = [];

  // countdown variables
  targetDate: any; // Set your target date here
  timeRemaining: timeInterface = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  timer: any;

  ngOnInit(): void {
    // countdown to next gp
    this.championshipNextTracks = this.dbData.getAllTracks();
    
    // filter next championship track
    const i = 0;
    const current_date: Date = new Date();
    for (const track of this.championshipNextTracks){
      const db_date: Date = new Date(track.date);
      if ( db_date >= current_date )
      {
        this.targetDate = new Date(db_date);
        break;
      }
    }

    if (this.targetDate) {this.startCountdown();}
   
  }

  startCountdown(): void {
    this.timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.targetDate.getTime() - now;

      // Calculate time remaining in days, hours, minutes, seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.timeRemaining = {
        days,
        hours,
        minutes,
        seconds
      };

      // If the countdown is over, clear the interval
      if (distance < 0) {
        clearInterval(this.timer);
        this.timeRemaining = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
    }, 1000); // Update every second for more accurate countdown
  }


  ngOnDestroy(): void {
    if (this.timer) 
      {clearInterval(this.timer);} // Cleanup the interval when the component is destroyed
    
  }
}
