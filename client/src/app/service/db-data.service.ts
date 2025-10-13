import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PostgresService, FantaService } from "@genezio-sdk/f123dashboard" 
import { Fanta, RaceResult } from '../model/fanta';
import { User } from '../model/auth';
import { GpResult } from '../model/championship'
import { Season } from '../model/season';
import { ChampionshipData } from '../model/championship-data';
import { AllDriverData, Driver } from '../model/driver';
import { TrackData, CumulativePointsData } from '../model/track';
import { Constructor, ConstructorGrandPrixPoints } from '../model/constructor';



@Injectable({
  providedIn: 'root'
})
export class DbDataService {

  constructor() { }

/****************************************************************/
//variabili locali
/****************************************************************/
  private allDrivers: string = "";
  private championship: ChampionshipData[] = [];
  private cumulative_points: string = "";
  private tracks: string = "";
  private fantaVoteSubject = new BehaviorSubject<Fanta[]>([]);
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
      PostgresService.getUsers(),
      PostgresService.getRaceResoult(),
      PostgresService.getConstructors(),
      PostgresService.getDriversData(),
      PostgresService.getConstructorGrandPrixPoints()
    ]);

    this.allDrivers = allDrivers;
    this.championship = JSON.parse(championship);
    this.cumulative_points = cumulativePoints;
    this.tracks = tracks;
    this.fantaVoteSubject.next(JSON.parse(fantaVote));
    this.users = JSON.parse(users);
    this.raceResult = JSON.parse(raceResult);
    this.constructors = JSON.parse(constructors);
    this.drivers = JSON.parse(drivers);
    this.constructorGrandPrixPoints = JSON.parse(constructorGrandPrixPoints);
  }

/****************************************************************/
//chiamate che trasferiscono le variabili alle varie pagine 
/****************************************************************/
  getAllDrivers(): AllDriverData[] {
    return JSON.parse(this.allDrivers);
  }

  getChampionship(): ChampionshipData[] {
    return this.championship;
  }

  getCumulativePoints(): CumulativePointsData[] {
    return JSON.parse(this.cumulative_points);
  }

  getAllTracks(): TrackData[] {
    return JSON.parse(this.tracks);
  }

  getFantaVote(): Fanta[] {
    return this.fantaVoteSubject.value;
  }

  getFantaVoteObservable(): Observable<Fanta[]> {
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

  async getDriversBySeason(seasonId?: number): Promise<AllDriverData[]> {
    const drivers = await PostgresService.getAllDrivers(seasonId);
    return JSON.parse(drivers);
  }

  async getDriversData(seasonId?: number): Promise<Driver[]> {
    const drivers = await PostgresService.getDriversData(seasonId);
    return JSON.parse(drivers);
  }

  async getChampionshipBySeason(seasonId?: number): Promise<ChampionshipData[]> {
    const championship = await PostgresService.getChampionship(seasonId);
    return JSON.parse(championship);
  }

  async getCumulativePointsBySeason(seasonId?: number): Promise<CumulativePointsData[]> {
    const cumulativePoints = await PostgresService.getCumulativePoints(seasonId);
    return JSON.parse(cumulativePoints);
  }

  async getAllTracksBySeason(seasonId?: number): Promise<TrackData[]> {
    const tracks = await PostgresService.getAllTracks(seasonId);
    return JSON.parse(tracks);
  }

  async getRaceResultBySeason(seasonId?: number): Promise<RaceResult[]> {
    const raceResult = await PostgresService.getRaceResoult(seasonId);
    return JSON.parse(raceResult);
  }

  async getAllSeasons(): Promise<Season[]> {
    const seasons = await PostgresService.getAllSeasons();
    return JSON.parse(seasons);
  }

  async getConstructorsBySeason(seasonId?: number): Promise<Constructor[]> {
    const constructors = await PostgresService.getConstructors(seasonId);
    return JSON.parse(constructors);
  }

  async getConstructorGrandPrixPoints(seasonId?: number): Promise<ConstructorGrandPrixPoints[]> {
    const constructorGpPoints = await (PostgresService as any).getConstructorGrandPrixPoints(seasonId);
    return JSON.parse(constructorGpPoints);
  }

  async setFantaVoto(voto: Fanta): Promise<void> {
    await FantaService.setFantaVoto(
      voto.fanta_player_id,
      voto.track_id,
      voto.id_1_place,
      voto.id_2_place,
      voto.id_3_place,
      voto.id_4_place,
      voto.id_5_place,
      voto.id_6_place,
      voto.id_7_place,
      voto.id_8_place,
      voto.id_fast_lap,
      voto.id_dnf,
      voto.constructor_id
    );
    
    // Refresh the fanta votes and notify subscribers
    const updatedFantaVote = await FantaService.getFantaVote();
    this.fantaVoteSubject.next(JSON.parse(updatedFantaVote));
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
