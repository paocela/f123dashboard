import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PostgresService, Season } from "@genezio-sdk/f123dashboard" 

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
    PostgresService.getAllSeasons().then((seasons: Season[]) => {
      if (seasons.length === 0) {
        console.error("No seasons found in the database.");
        return;
      }
      this.allSesons = seasons;
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