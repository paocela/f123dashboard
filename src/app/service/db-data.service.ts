import { Injectable } from '@angular/core';



interface Piloti {
  username: string;
  description: string;
  car: string;
  pilot: string;
  Championship : number,
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
    username: 'redmamba_99_',
    description: 'Non è bravo come programmatore ma come pilota se la cava. Durante la scorsa stagione ha fatto notare la sua crescita vincendo il campionato.',
    car: './assets/images/constructors/alpine.svg',
    pilot: 'Gasly',
    Championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 1,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/1.jpg',
    color: 'success',
    radarData: [80, 20, 10, 70, 90]
  },
  {
    username: 'GiannisCorbe',
    description: 'Descrizione per GiannisCorbe. ',
    car: './assets/images/constructors/haas.svg',
    pilot: 'Magnussen',
    Championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 2,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/2.jpg',
    color: 'danger',
    radarData: [90, 30, 50, 70, 90]
  },
  {
    username: 'HeavyButt',
    description: 'Descrizione per HeavyButt.',
    car: './assets/images/constructors/mercedes.svg',
    pilot: 'Hamilton',
    Championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 3,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/3.jpg',
    color: 'info',
    radarData: [60, 100, 70, 90, 60]
  },
  {
    username: 'Marcogang97',
    description: 'Descrizione per Marcogang97.',
    car: './assets/images/constructors/ferrari.svg',
    pilot: 'Leclerc',
    Championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 4,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/4.jpg',
    color: 'secondary',
    radarData: [60, 30, 80, 30, 50]
  },
  {
    username: 'FASTman',
    description: 'è il pilota più bravo di tutta la contea',
    car: './assets/images/constructors/redbull.svg',
    pilot: 'Verstappen',
    Championship : 500,
    race:100,
    qualify: 100,
    sprint: 100,
    practice: 100,
    position: 5,
    lastwin: '16/10/2024',
    avatar: './assets/images/avatars/5.jpg',
    color: 'primary',
    radarData: [50, 30, 80, 40, 50]
  }
];
  constructor() { }

  getPiloti(){
   return(this.piloti) 
  }




}
