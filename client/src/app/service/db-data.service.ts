import { Injectable } from '@angular/core';
import { PostgresService, FantaService } from "@genezio-sdk/f123dashboard" 
import { Fanta, FantaPlayer } from '../model/fanta';
import { User } from '../model/user';



@Injectable({
  providedIn: 'root'
})
export class DbDataService {

  constructor() { }

/****************************************************************/
//variabili locali
/****************************************************************/
  drivers: string = "";
  championship: string = "";
  cumulative_points: string = "";
  tracks: string = "";
  fantaVote!: Fanta[];
  raceResult: any[] = [];
  users: User[] = [];


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
    this.championship = championship;
    this.cumulative_points = cumulativePoints;
    this.tracks = tracks;
    this.fantaVote = JSON.parse(fantaVote);
    this.users = JSON.parse(users);
    this.raceResult = JSON.parse(raceResult);
  } 

/****************************************************************/
//chiamate che trasferiscono le variabili alle varie pagine 
/****************************************************************/
  getAllDrivers() {
    return JSON.parse(this.drivers);
  }

  getChampionship() {
    return JSON.parse(this.championship);
  }

  getCumulativePoints() {
    return JSON.parse(this.cumulative_points);
  }

  getAllTracks() {
    return JSON.parse(this.tracks);
  }

  getFantaVote(): Fanta[] {
    return this.fantaVote;
  }

  getRaceResoult(): any {
    return this.raceResult;
  }
  
  getUsers(): User[] {
    return this.users;
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

}
