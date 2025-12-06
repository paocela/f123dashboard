import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import type { FantaVote, DriverData, Driver, ChampionshipData, Season, CumulativePointsData, TrackData, User, RaceResult, ConstructorGrandPrixPoints, Constructor } from '@f123dashboard/shared';
import { GpResult } from '../model/championship';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbDataService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

/****************************************************************/
//variabili locali
/****************************************************************/
  private allDrivers: DriverData[] = [];
  private championship: ChampionshipData[] = [];
  private cumulative_points: CumulativePointsData[] = [];
  private tracks: TrackData[] = [];
  private fantaVoteSubject = new BehaviorSubject<FantaVote[]>([]);
  public  fantaVote$ = this.fantaVoteSubject.asObservable();
  private raceResult: RaceResult[] = [];
  private users: User[] = [];
  private drivers: Driver[] = [];
  private constructorGrandPrixPoints: ConstructorGrandPrixPoints[] = [];
  private constructors: Constructor[] = [];


/****************************************************************/
//compilazione delle variabili pre caricamento del interfaccia web 
/****************************************************************/

  async AllData() {
    const [
      allDrivers,
      championship,
      cumulativePoints,
      tracks,
      fantaVote,
      users,
      raceResult,
      constructors,
      drivers,
      constructorGrandPrixPoints

    ] = await Promise.all([
      firstValueFrom(this.apiService.post<DriverData[]>('/database/drivers', {})),
      firstValueFrom(this.apiService.post<ChampionshipData[]>('/database/championship', {})),
      firstValueFrom(this.apiService.post<CumulativePointsData[]>('/database/cumulative-points', {})),
      firstValueFrom(this.apiService.post<TrackData[]>('/database/tracks', {})),
      firstValueFrom(this.apiService.post<FantaVote[]>('/fanta/votes', {})),
      firstValueFrom(this.apiService.post<User[]>('/auth/users', {})),
      firstValueFrom(this.apiService.post<RaceResult[]>('/database/race-results', {})),
      firstValueFrom(this.apiService.post<Constructor[]>('/database/constructors', {})),
      firstValueFrom(this.apiService.post<Driver[]>('/database/drivers-data', {})),
      firstValueFrom(this.apiService.post<ConstructorGrandPrixPoints[]>('/database/constructor-grand-prix-points', {}))
    ]);

    this.allDrivers = allDrivers;
    this.championship = championship;
    this.cumulative_points = cumulativePoints;
    this.tracks = tracks;
    this.fantaVoteSubject.next(fantaVote);
    this.users = users;
    this.raceResult = raceResult;
    this.constructors = constructors;
    this.drivers = drivers;
    this.constructorGrandPrixPoints = constructorGrandPrixPoints;
  }

/****************************************************************/
//chiamate che trasferiscono le variabili alle varie pagine 
/****************************************************************/
  getAllDrivers(): DriverData[] {
    return this.allDrivers;
  }

  getChampionship(): ChampionshipData[] {
    return this.championship;
  }

  getCumulativePoints(): CumulativePointsData[] {
    return this.cumulative_points;
  }

  getAllTracks(): TrackData[] {
    return this.tracks;
  }

  getFantaVote(): FantaVote[] {
    return this.fantaVoteSubject.value;
  }

  getFantaVoteObservable(): Observable<FantaVote[]> {
    return this.fantaVote$;
  }

  getRaceResoult(): RaceResult[] {
    return this.raceResult;
  }
  
  getUsers(): User[] {
    return this.users;
  }
  getDrivers(): Driver[] {
    return this.drivers;
  }


  //TODO fix hardcoded drivers in constructors
  getConstructors(): Constructor[] {
    for (const constructor of this.constructors) {
      if (constructor.constructor_id == 1) {
        constructor.driver_1_id = 10;
        constructor.driver_1_username = "Marcogang96";
        constructor.driver_2_id = 11;
        constructor.driver_2_username = "GiannisCorbe";
      } else if (constructor.constructor_id == 4) {
        constructor.driver_1_id = 14;
        constructor.driver_1_username = "redmamba_99_";
        constructor.driver_2_id = 16;
        constructor.driver_2_username = "JJKudos";
      } else if (constructor.constructor_id == 2) {
        constructor.driver_1_id = 12;
        constructor.driver_1_username = "Lil Mvrck";
        constructor.driver_2_id = 17;
        constructor.driver_2_username = "Octimus10";
      } else if (constructor.constructor_id == 3) {
        constructor.driver_1_id = 13;
        constructor.driver_1_username = "FASTman";
        constructor.driver_2_id = 15;
        constructor.driver_2_username = "Dreandos";
      }
    }
    return this.constructors;
  }

  getConstructorGrandPrixPointsData(): ConstructorGrandPrixPoints[] {
    return this.constructorGrandPrixPoints;
  }

  getWinningConstructorGrandPrixPointsData(): ConstructorGrandPrixPoints[] {
    const allConstructorGpPoints = this.constructorGrandPrixPoints
    
    // Group by grand_prix_id and find the constructor with the highest points for each race
    const winningConstructorsByRace = new Map<number, ConstructorGrandPrixPoints>();
    
    allConstructorGpPoints.forEach(entry => {
      const existingWinner = winningConstructorsByRace.get(entry.grand_prix_id);
      
      if (!existingWinner || entry.constructor_points > existingWinner.constructor_points) {
        winningConstructorsByRace.set(entry.grand_prix_id, entry);
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(winningConstructorsByRace.values())
      .sort((a, b) => new Date(a.grand_prix_date).getTime() - new Date(b.grand_prix_date).getTime());
  }
/****************************************************************/
//season-specific data methods
/****************************************************************/

  async getDriversBySeason(seasonId?: number): Promise<DriverData[]> {
    const drivers = await firstValueFrom(
      this.apiService.post<DriverData[]>('/database/drivers', { seasonId })
    );
    return drivers;
  }

  async getDriversData(seasonId?: number): Promise<Driver[]> {
    const drivers = await firstValueFrom(
      this.apiService.post<Driver[]>('/database/drivers-data', { seasonId })
    );
    return drivers;
  }

  async getChampionshipBySeason(seasonId?: number): Promise<ChampionshipData[]> {
    const championship = await firstValueFrom(
      this.apiService.post<ChampionshipData[]>('/database/championship', { seasonId })
    );
    return championship;
  }

  async getCumulativePointsBySeason(seasonId?: number): Promise<CumulativePointsData[]> {
    const cumulativePoints = await firstValueFrom(
      this.apiService.post<CumulativePointsData[]>('/database/cumulative-points', { seasonId })
    );
    return cumulativePoints;
  }

  async getAllTracksBySeason(seasonId?: number): Promise<TrackData[]> {
    const tracks = await firstValueFrom(
      this.apiService.post<TrackData[]>('/database/tracks', { seasonId })
    );
    return tracks;
  }

  async getRaceResultBySeason(seasonId?: number): Promise<RaceResult[]> {
    const raceResult = await firstValueFrom(
      this.apiService.post<RaceResult[]>('/database/race-results', { seasonId })
    );
    return raceResult;
  }

  async getAllSeasons(): Promise<Season[]> {
    const seasons = await firstValueFrom(
      this.apiService.post<Season[]>('/database/seasons', {})
    );
    return seasons;
  }

  async getConstructorsBySeason(seasonId?: number): Promise<Constructor[]> {
    const constructors = await firstValueFrom(
      this.apiService.post<Constructor[]>('/database/constructors', { seasonId })
    );
    return constructors;
  }

  async getConstructorGrandPrixPoints(seasonId?: number): Promise<ConstructorGrandPrixPoints[]> {
    const constructorGpPoints = await firstValueFrom(
      this.apiService.post<ConstructorGrandPrixPoints[]>('/database/constructor-grand-prix-points', { seasonId })
    );
    return constructorGpPoints;
  }

  async setFantaVoto(voto: FantaVote): Promise<void> {
    await firstValueFrom(
      this.apiService.post('/fanta/set-vote', voto)
    );
    
    // Refresh the fanta votes and notify subscribers
    const updatedFantaVote = await firstValueFrom(
      this.apiService.post<FantaVote[]>('/fanta/votes', {})
    );
    this.fantaVoteSubject.next(updatedFantaVote);
  }


  async setGpResult(trackId: number, gpResult: GpResult): Promise<string> {
    try {
      const result = await firstValueFrom(
        this.apiService.post<string>('/database/set-gp-result', {
          trackId: +trackId,
          hasSprint: gpResult.hasSprint,
          raceResult: gpResult.raceResult,
          raceDnfResult: gpResult.raceDnfResult,
          sprintResult: gpResult.sprintResult,
          sprintDnfResult: gpResult.sprintDnfResult,
          qualiResult: gpResult.qualiResult,
          fpResult: gpResult.fpResult,
          seasonId: gpResult.seasonId
        })
      );
      return result;
    } catch (error) {
      console.error('Error setting GP result:', error);
      throw new Error(`Failed to set GP result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvatarSrc(user: User | null): string {
    if (user?.image) {
      // Handle case where image might be a Buffer or other non-string type
      const image = user.image as any; // Type assertion since image can be Buffer from DB
      let imageStr: string;
      
      if (typeof image === 'string') {
        imageStr = image;
      } else if (image instanceof ArrayBuffer || image instanceof Uint8Array) {
        // Convert Buffer/ArrayBuffer to base64 string
        const bytes = new Uint8Array(image);
        imageStr = btoa(String.fromCharCode(...bytes));
      } else if (image && typeof image === 'object' && 'data' in image) {
        // Handle Buffer-like object with data property
        const bytes = new Uint8Array(image.data);
        imageStr = btoa(String.fromCharCode(...bytes));
      } else {
        // Try to convert to string
        imageStr = String(image);
      }
      
      // Check if it's already a data URL (base64)
      if (imageStr.startsWith('data:')) {
        return imageStr;
      }
      // If it's base64 without data URL prefix, add it
      return `data:image/jpeg;base64,${imageStr}`;
    }
    // Fallback to file path
    return `./assets/images/avatars_fanta/${user?.id || 'default'}.png`;
  }

}
