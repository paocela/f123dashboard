import { Injectable } from '@angular/core';
import { PostgresService } from "@genezio-sdk/f123dashboard" 

interface Piloti {
  username: string;
  name: string;
  surname: string;
  description: string;
  car: string;
  pilot: string;
  championship : number,
  race:number,
  qualify: number,
  sprint: number,
  practice: number,
  position: number;
  lastwin: string;
  avatar: string;
  color: string;
  radarData: number[];
}



@Injectable({
  providedIn: 'root'
})
export class DbDataService {
//dati temporanei per vedere se funziona il collegamento fra le pagine 
piloti: Piloti[] = [
  {
    username: '',
    name: '',
    surname: '',
    description: '',
    car: './assets/images/constructors/alpine.svg',
    pilot: 'Gasly',
    championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 1,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/1.jpg',
    color: 'success',
    radarData: []
  },
  {
    username: '',
    name: '',
    surname: '',
    description: '',
    car: './assets/images/constructors/haas.svg',
    pilot: 'Magnussen',
    championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 2,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/2.jpg',
    color: 'danger',
    radarData: []
  },
  {
    username: '',
    name: '',
    surname: '',
    description: '',
    car: './assets/images/constructors/mercedes.svg',
    pilot: 'Hamilton',
    championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 3,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/3.jpg',
    color: 'info',
    radarData: []
  },
  {
    username: '',
    name: '',
    surname: '',
    description: '',
    car: './assets/images/constructors/ferrari.svg',
    pilot: 'Leclerc',
    championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 4,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/4.jpg',
    color: 'secondary',
    radarData: []
  },
  {
    username: '',
    name: '',
    surname: '',
    description: '',
    car: './assets/images/constructors/redbull.svg',
    pilot: 'Verstappen',
    championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 5,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/5.jpg',
    color: 'primary',
    radarData: []
  }
];
  constructor() { }

  drivers: string = "";
  championship: string = "";
  cumulative_points: string = "";

//compilazione delle variabili pre caricamento del interfaccia web 
  async queryAllDrivers() {
    this.drivers = await PostgresService.getAllDrivers();
    this.championship = await PostgresService.getChampionship();
    this.cumulative_points = await PostgresService.getCumulativePoints();
  }

//chiamate che trasferiscono le variabili alle varie pagine 
  getAllDrivers() {
    return JSON.parse(this.drivers);
  }

  getChampionship() {
    return JSON.parse(this.championship);
  }

  getCumulativePoints() {
    return JSON.parse(this.cumulative_points);
  }


}
