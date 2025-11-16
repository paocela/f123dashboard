import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PostgresService, FantaService, FantaVote, DriverData, Driver, ChampionshipData, Season, CumulativePointsData, TrackData, AuthService, User, RaceResult, ConstructorGrandPrixPoints, Constructor } from "@genezio-sdk/f123dashboard" 
import { GpResult } from '../model/championship'

@Injectable({
  providedIn: 'root'
})
export class DbDataService {

  constructor() { }

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
      PostgresService.getAllDrivers(),
      PostgresService.getChampionship(),
      PostgresService.getCumulativePoints(),
      PostgresService.getAllTracks(),
      FantaService.getFantaVote(),
      AuthService.getUsers(),
      PostgresService.getRaceResoult(),
      PostgresService.getConstructors(),
      PostgresService.getDriversData(),
      PostgresService.getConstructorGrandPrixPoints()
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
      if (constructor.constructor_id === 1) {
        constructor.driver_1_id = 10;
        constructor.driver_1_username = "Marcogang96";
        constructor.driver_2_id = 11;
        constructor.driver_2_username = "GiannisCorbe";
      } else if (constructor.constructor_id === 4) {
        constructor.driver_1_id = 14;
        constructor.driver_1_username = "redmamba_99_";
        constructor.driver_2_id = 16;
        constructor.driver_2_username = "JJKudos";
      } else if (constructor.constructor_id === 2) {
        constructor.driver_1_id = 12;
        constructor.driver_1_username = "Lil Mvrck";
        constructor.driver_2_id = 17;
        constructor.driver_2_username = "Octimus10";
      } else if (constructor.constructor_id === 3) {
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
    const drivers = await PostgresService.getAllDrivers(seasonId);
    return drivers;
  }

  async getDriversData(seasonId?: number): Promise<Driver[]> {
    const drivers = await PostgresService.getDriversData(seasonId);
    return drivers;
  }

  async getChampionshipBySeason(seasonId?: number): Promise<ChampionshipData[]> {
    const championship = await PostgresService.getChampionship(seasonId);
    return championship;
  }

  async getCumulativePointsBySeason(seasonId?: number): Promise<CumulativePointsData[]> {
    const cumulativePoints = await PostgresService.getCumulativePoints(seasonId);
    return cumulativePoints;
  }

  async getAllTracksBySeason(seasonId?: number): Promise<TrackData[]> {
    const tracks = await PostgresService.getAllTracks(seasonId);
    return tracks;
  }

  async getRaceResultBySeason(seasonId?: number): Promise<RaceResult[]> {
    const raceResult = await PostgresService.getRaceResoult(seasonId);
    return raceResult;
  }

  async getAllSeasons(): Promise<Season[]> {
    const seasons = await PostgresService.getAllSeasons();
    return seasons;
  }

  async getConstructorsBySeason(seasonId?: number): Promise<Constructor[]> {
    const constructors = await PostgresService.getConstructors(seasonId);
    return constructors;
  }

  async getConstructorGrandPrixPoints(seasonId?: number): Promise<ConstructorGrandPrixPoints[]> {
    const constructorGpPoints = await (PostgresService as any).getConstructorGrandPrixPoints(seasonId);
    return constructorGpPoints;
  }

  async setFantaVoto(voto: FantaVote): Promise<void> {
    await FantaService.setFantaVoto(voto);
    
    // Refresh the fanta votes and notify subscribers
    const updatedFantaVote = await FantaService.getFantaVote();
    this.fantaVoteSubject.next(updatedFantaVote);
  }


  async setGpResult(trackId: number, gpResult: GpResult): Promise<string> {
    try {
      const result = await PostgresService.setGpResult(
        +trackId,
        gpResult.hasSprint,
        gpResult.raceResult,
        gpResult.raceDnfResult,
        gpResult.sprintResult,
        gpResult.sprintDnfResult,
        gpResult.qualiResult,
        gpResult.fpResult,
        gpResult.seasonId
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
