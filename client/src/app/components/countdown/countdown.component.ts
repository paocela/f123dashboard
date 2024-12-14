import { Component, DestroyRef, effect, inject, OnInit, OnDestroy, Renderer2, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { cilArrowRight, cilChartPie } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  CardTextDirective,
  CardTitleDirective,
  ColComponent,
  RowComponent,
  TextColorDirective
} from '@coreui/angular';
import {DbDataService} from 'src/app/service/db-data.service';  //aggiunto il servizio per dati db

interface timeInterface {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'countdown-component',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    IconDirective,
    CardComponent, CardHeaderComponent, CardBodyComponent, CardTitleDirective, CardTextDirective
  ],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss'
})
export class CountdownComponent implements OnInit, OnDestroy {

  constructor(private dbData: DbDataService) {}

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
    this.startCountdown();
    this.championshipNextTracks = this.dbData.getAllTracks();

    // filter next championship track
    var i = 0;
    const current_date: Date = new Date();
    current_date.setHours(0, 0, 0, 0);
    for (let track of this.championshipNextTracks){
      const db_date: Date = new Date(track.date);
      db_date.setHours(0, 0, 0, 0);
      if ( db_date >= current_date )
      {
        this.targetDate = new Date(db_date);
        break;
      }
    }
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
    if (this.timer) {
      clearInterval(this.timer); // Cleanup the interval when the component is destroyed
    }
  }
}
