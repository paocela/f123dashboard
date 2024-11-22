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
  ChampionshipTrend: string = "";




/****************************************************************/
//compilazione delle variabili pre caricamento del interfaccia web 
/****************************************************************/
async AllData() {

  this.drivers = await PostgresService.getAllDrivers();

  this.ChampionshipTrend = await PostgresService.getChampionshipTrend();
}

  

/****************************************************************/
//chiamate che trasferiscono le variabili alle varie pagine 
/****************************************************************/
  getAllDrivers() {
    return JSON.parse(this.drivers);
  }
  championshipTrend() {
    return JSON.parse(this.ChampionshipTrend);
  }

}
