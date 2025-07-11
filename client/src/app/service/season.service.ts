import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PostgresService } from "@genezio-sdk/f123dashboard" 
import { Season } from '../model/season';
import { z } from "zod";

const schema = z.coerce.date().optional();

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private allSesons: Season[] = [];
  private _currentSeason = new BehaviorSubject<Season>(null!);
  public readonly season$ = this._currentSeason.asObservable();
  

  setCurreentSeason(season: Season) {
    this._currentSeason.next(season);
  }
  getCurrentSeason(): Season {
    return this._currentSeason.getValue();
  }

  public getAllSeasons(): Season[] {
    return this.allSesons;
  }

  public setAllSeasons() {
    PostgresService.getAllSeasons().then((seasons: string) => {
      
      JSON.parse(seasons).forEach((season: any) => {
  
        this.allSesons.push({
          id: season.id,
          description: season.description,
          startDate: new Date(season.start_date),
          endDate: new Date(season.end_date)
        })
      });
      if (this.allSesons.length === 0) {
        console.error("No seasons found in the database.");
        return;
      }
      const latestSeason = this.allSesons.reduce((latest, current) => 
        latest?.startDate && current?.startDate && latest.startDate > current.startDate ? latest : current
        , this.allSesons[0]
      );
      this.setCurreentSeason(latestSeason);
    }).catch((error: any) => {
      console.error("Error fetching seasons:", error);
    });
  }

}