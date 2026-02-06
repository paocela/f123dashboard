import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import {
  CardBodyComponent,
  CardComponent} from '@coreui/angular';
import {DbDataService} from '../../service/db-data.service';
import { TrackData } from '@f123dashboard/shared';

interface TimeInterface {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
    selector: 'app-countdown',
    imports: [
        CommonModule,
        CardComponent, CardBodyComponent
    ],
    templateUrl: './countdown.component.html',
    styleUrl: './countdown.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountdownComponent implements OnInit, OnDestroy {
  private dbData = inject(DbDataService);
  private cdr = inject(ChangeDetectorRef);


  public championshipNextTracks: TrackData[] = [];

  // countdown variables
  targetDate?: Date;
  timeRemaining: TimeInterface = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // countdown to next gp
    this.championshipNextTracks = this.dbData.getAllTracks();
    
    // filter next championship track
    const currentDate = new Date();
    this.targetDate = this.championshipNextTracks
      .map(track => new Date(track.date))
      .sort((a, b) => a.getTime() - b.getTime())
      .find(dbDate => dbDate >= currentDate);

    if (this.targetDate) {this.startCountdown();}
   
  }

  startCountdown(): void {
    this.timer = setInterval(() => {

      if (!this.targetDate) {
        return;
      }

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

      this.cdr.markForCheck();

      // If the countdown is over, clear the interval
      if (distance < 0) {
        clearInterval(this.timer);
        this.timeRemaining = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
        this.cdr.markForCheck();
      }
    }, 1000); // Update every second for more accurate countdown
  }


  ngOnDestroy(): void {
    if (this.timer) 
      {
        clearInterval(this.timer);
      }
  }
}
