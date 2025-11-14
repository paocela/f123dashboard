import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import type { Season } from '@f123dashboard/shared';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private apiService = inject(ApiService);
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
    firstValueFrom(
      this.apiService.post<Season[]>('/database/seasons', {})
    ).then((seasons: Season[]) => {
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
    }).catch((error: unknown) => {
      console.error("Error fetching seasons:", error);
    });
  }

}