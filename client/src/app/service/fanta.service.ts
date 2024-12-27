import { Injectable } from '@angular/core';
import { DbDataService } from './db-data.service';
import { Fanta } from '../model/fanta';
import { LeaderBoard } from '../model/leaderboard';


@Injectable({
  providedIn: 'root'
})
export class FantaService {
  fantaData: any[];
  fantaPoints: Map<number,number> = new Map<number,number>();
  fantaVote:  Fanta[] = [];

  constructor(private dbData: DbDataService) {
    this.fantaData = this.dbData.getAllFanta();

    let fantaVotes: Fanta[] = this.dbData.getFantaVote();
    console.log("fataVotes");
    console.log(fantaVotes);

    let raceResults: any[] = this.dbData.getRaceResoult();
    console.log("raceResults");
    console.log(raceResults);

    raceResults.forEach(raceResult => {
      console.log(raceResult.id);
      const raceVotes = fantaVotes.filter(item => item.raceid === raceResult.id);
      console.log("racevotes");
      console.log(raceVotes);

      raceVotes.forEach(raceVote => {
        const racePoint =  this.calculateFantaPoints(raceResult,raceVote);
        console.log(racePoint);
        this.fantaPoints.set(
          Number(raceVote.fantaplayerid),
          (this.fantaPoints.get(raceVote.fantaplayerid) ?? 0) + racePoint
        );
        console.log(this.fantaPoints);
      });

    });
    //order by points
    this.fantaPoints = new Map(Array.from(this.fantaPoints.entries()).sort(([, valueA], [, valueB]) => valueA - valueB));

   }

   getFantaPoints(username: number): number{
    return this.fantaPoints.get(username) ?? 0;
   }

   getFantaVote( userId:number, raceId:number): Fanta | undefined {
    return this.fantaVote.filter(vote => vote.fantaplayerid === userId)
                .find(vote => vote.raceid === raceId);
   }


  calculateFantaPoints(raceResout: any, fantaVote: Fanta): number {
    var points: number = 0;
    const correctResponsePoint = 2;
    raceResout.place1id === fantaVote.place1id ? console.log("uguale") : console.log("diverso");
    points = raceResout.place1id === fantaVote.place1id ? points + correctResponsePoint : points;
    points = raceResout.place2id === fantaVote.place2id ? points + correctResponsePoint : points;
    points = raceResout.place3id === fantaVote.place3id ? points + correctResponsePoint : points;
    points = raceResout.place6id === fantaVote.place6id ? points + correctResponsePoint : points;
    points = raceResout.place4id === fantaVote.place4id ? points + correctResponsePoint : points;
    points = raceResout.place5id === fantaVote.place5id ? points + correctResponsePoint : points;
    return points;
  }

  
  
}
