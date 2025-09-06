import { Injectable } from '@angular/core';
import { PostgresService, FantaService } from "@genezio-sdk/f123dashboard" 
import { Fanta, FantaPlayer, RaceResult } from '../model/fanta';
import { User } from '../model/auth';
import { GpResult } from '../model/championship'
import { Season } from '../model/season';
import { ChampionshipData } from '../model/championship-data';
import { DriverData } from '../model/driver';
import { TrackData, CumulativePointsData } from '../model/track';



@Injectable({
  providedIn: 'root'
})
export class DbDataService {

  constructor() { }

/****************************************************************/
//variabili locali
/****************************************************************/
  private drivers: string = "";
  private championship: ChampionshipData[] = [];
  private cumulative_points: string = "";
  private tracks: string = "";
  private fantaVote!: Fanta[];
  private raceResult: RaceResult[] = [];
  private users: User[] = [];


/****************************************************************/
//compilazione delle variabili pre caricamento del interfaccia web 
/****************************************************************/

  async AllData() {
    const [
      drivers,
      championship,
      cumulativePoints,
      tracks,
      fantaVote,
      users,
      raceResult
    ] = await Promise.all([
      PostgresService.getAllDrivers(),
      PostgresService.getChampionship(),
      PostgresService.getCumulativePoints(),
      PostgresService.getAllTracks(),
      FantaService.getFantaVote(),
      PostgresService.getUsers(),
      PostgresService.getRaceResoult()
    ]);

    this.drivers = drivers;
    this.championship = JSON.parse(championship);
    this.cumulative_points = cumulativePoints;
    this.tracks = tracks;
    this.fantaVote = JSON.parse(fantaVote);
    this.users = JSON.parse(users);
    this.raceResult = JSON.parse(raceResult);
  } 

/****************************************************************/
//chiamate che trasferiscono le variabili alle varie pagine 
/****************************************************************/
  getAllDrivers(): DriverData[] {
    return JSON.parse(this.drivers);
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
    return this.fantaVote;
  }

  getRaceResoult(): RaceResult[] {
    return this.raceResult;
  }
  
  getUsers(): User[] {
    return this.users;
  }

/****************************************************************/
//season-specific data methods
/****************************************************************/

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

/****************************************************************/
//existing methods
/****************************************************************/

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
      voto.id_fast_lap,
      voto.id_dnf
    );
  }

  async setFantaPlayer(player: FantaPlayer): Promise<void> {
    await FantaService.setFantaPlayer(player.username, 
      player.name, 
      player.surname, 
      player.password);
  }

  async setGpResult(trackId: Number, gpResult: GpResult): Promise<void> {
    // await PostgresService.setGpResult(+trackId,
    //                               gpResult.hasSprint,
    //                               gpResult.raceResult,
    //                               gpResult.raceDnfResult,
    //                               gpResult.sprintResult,
    //                               gpResult.sprintDnfResult,
    //                               gpResult.qualiResult,
    //                               gpResult.fpResult);
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
