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
    this.drivers = await PostgresService.getAllDrivers();
    this.championship = await PostgresService.getChampionship();
    this.cumulative_points = await PostgresService.getCumulativePoints();
    this.tracks = await PostgresService.getAllTracks();
    this.fantaVote = JSON.parse(await FantaService.getFantaVote());
    this.users = JSON.parse(await PostgresService.getUsers());
    this.raceResult = JSON.parse(await PostgresService.getRaceResoult());
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
