import { Injectable } from '@angular/core';
import { DbDataService } from './db-data.service';
import { Fanta, RaceResult } from '../model/fanta';
import { LeaderBoard } from '../model/leaderboard';


@Injectable({
  providedIn: 'root'
})
export class FantaService {
  fantaPoints: Map<number,number> = new Map<number,number>();
  fantaVotes:  Fanta[] = [];
  raceResults: RaceResult[] = [];
  allDrivers: any[] = [];

  correctResponsePoint: number = 1;
  correctResponsePointFastLap: number = 2
  correctResponsePointDnf: number = 2;

  constructor(private dbData: DbDataService) {
    this.fantaVotes = this.dbData.getFantaVote();
    this.raceResults = this.dbData.getRaceResoult();
    this.allDrivers = this.dbData.getAllDrivers();

    this.raceResults.forEach(raceResult => {
      const raceVotes = this.fantaVotes.filter(item => item.track_id == raceResult.track_id);
      raceVotes.forEach(raceVote => {
        const racePoints: number =  this.calculateFantaPoints(raceResult, raceVote);
        this.fantaPoints.set(Number(raceVote.fanta_player_id), (this.fantaPoints.get(Number(raceVote.fanta_player_id)) ?? 0) + racePoints);
      });
    });

    //order by points
    this.fantaPoints = new Map(Array.from(this.fantaPoints.entries()).sort(([, valueA], [, valueB]) => valueA - valueB));
   }

   getFantaPoints(userId: number): number{
    return this.fantaPoints.get(Number(userId)) ?? 0;
   }

   getFantaVote( userId:number, raceId:number): Fanta | undefined {
    return this.fantaVotes.filter(vote => vote.fanta_player_id == userId)
                .find(vote => vote.track_id == raceId);
   }

   getRaceResult(raceId: number): RaceResult | undefined {
    return this.raceResults.find(race => race.track_id == raceId);
   }


  calculateFantaPoints(raceResult: any, fantaVote: Fanta): number {
    var points: number = 0;

    points = raceResult.id_1_place === fantaVote.id_1_place ? points + this.correctResponsePoint : points;
    points = raceResult.id_2_place === fantaVote.id_2_place ? points + this.correctResponsePoint : points;
    points = raceResult.id_3_place === fantaVote.id_3_place ? points + this.correctResponsePoint : points;
    points = raceResult.id_4_place === fantaVote.id_4_place ? points + this.correctResponsePoint : points;
    points = raceResult.id_5_place === fantaVote.id_5_place ? points + this.correctResponsePoint : points;
    points = raceResult.id_6_place === fantaVote.id_6_place ? points + this.correctResponsePoint : points;
    points = raceResult.id_fast_lap === fantaVote.id_fast_lap ? points + this.correctResponsePointFastLap : points;
    points = this.isDnfCorrect(raceResult.list_dnf, fantaVote.id_dnf) ? points + this.correctResponsePointDnf : points;

    return points;
  }

  getCorrectResponsePoint(): number {
    return this.correctResponsePoint;
  }

  getCorrectResponsePointFastLap(): number {
    return this.correctResponsePointFastLap;
  }

  getCorrectResponsePointDnf(): number {
    return this.correctResponsePointDnf;
  }

  isDnfCorrect(raceResultDnf: string, fantaVoteDnfId: number) {
    let fantaVoteDnfUsername: string = this.allDrivers.find(driver => driver.driver_id == fantaVoteDnfId)?.driver_username;
    return raceResultDnf.includes(fantaVoteDnfUsername);
  }

  
  
}
