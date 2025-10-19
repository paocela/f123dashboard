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

  getConstructors(): Constructor[] {
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


  async setGpResult(trackId: Number, gpResult: GpResult): Promise<string> {
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
      // Check if it's already a data URL (base64)
      if (user.image.startsWith('data:')) {
        return user.image;
      }
      // If it's base64 without data URL prefix, add it
      return `data:image/jpeg;base64,${user.image}`;
    }
    // Fallback to file path
    return `./assets/images/avatars_fanta/${user?.id || 'default'}.png`;
  }

}
