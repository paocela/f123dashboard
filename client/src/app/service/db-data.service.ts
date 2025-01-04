import { Injectable } from '@angular/core';
import { PostgresService } from "@genezio-sdk/f123dashboard" 
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
  fanta: string = "";
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
    this.fanta = await PostgresService.getAllFanta();
    this.fantaVote = JSON.parse(await PostgresService.getFantaVote());
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

  getAllFanta() {
    return JSON.parse(this.fanta);
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
    await PostgresService.setFantaVoto(voto);
  }

  async setFantaPlayer(player: FantaPlayer): Promise<void> {
    await PostgresService.setFantaPlayer(player);
    console.log("ok fatto")
  }

}
