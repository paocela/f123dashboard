import { Component } from '@angular/core';
import {DbDataService} from 'src/app/service/db-data.service';  //aggiunto il servizio per dati db

@Component({
  selector: 'app-fanta',
  standalone: true,
  imports: [],
  templateUrl: './fanta.component.html',
  styleUrl: './fanta.component.scss'
})
export class FantaComponent {

  constructor(private dbData: DbDataService) {} //aggiunto il servizio per dati db

  public fantaData: any[] = [];
  public fantaPoints: any[] = [];

  ngOnInit(): void {
    this.fantaData = this.dbData.getAllFanta();

    for (let fanta_entry of this.fantaData) {
      this.fantaPoints[fanta_entry["username"]] += this.calculateFantaPoints(fanta_entry);
    }
    
    console.log(this.fantaPoints);
  }

  calculateFantaPoints(entry: any): number {
    var results_array = [entry["driver_race_1_place"], entry["driver_race_2_place"], entry["driver_race_3_place"], entry["driver_race_4_place"], entry["driver_race_5_place"], entry["driver_race_6_place"], entry["driver_race_fast_lap"]];
    var picks_array = [entry["1_place_pick"], entry["2_place_pick"], entry["3_place_pick"], entry["4_place_pick"], entry["5_place_pick"], entry["6_place_pick"], entry["fast_lap_pick"]];

    var and_array = results_array.map((item, index) => (item === picks_array[index] ? 1 : 0));
    return 0;
  }

}
