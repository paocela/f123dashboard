import { Injectable } from '@angular/core';
import { PostgresService } from "@genezio-sdk/f123dashboard" 



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

/****************************************************************/
//compilazione delle variabili pre caricamento del interfaccia web 
/****************************************************************/

  async AllData() {
    this.drivers = await PostgresService.getAllDrivers();
    this.championship = await PostgresService.getChampionship();
    this.cumulative_points = await PostgresService.getCumulativePoints();
    this.tracks = await PostgresService.getAllTracks();
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

}
