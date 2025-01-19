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

  CORRECT_RESPONSE_FAST_LAP_POINTS: number = 5;
  CORRECT_RESPONS_DNF_POINTS: number = 5;
  CORRET_RESPONSE_POINTS: Readonly<Record<number, number>> = {
    0: 7,
    1: 4,
    2: 2
  };


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

    points = this.pointsWithAbsoluteDifference(raceResult.id_1_place, fantaVote.id_1_place) + points;
    points = this.pointsWithAbsoluteDifference(raceResult.id_2_place, fantaVote.id_2_place) + points;
    points = this.pointsWithAbsoluteDifference(raceResult.id_3_place, fantaVote.id_3_place) + points;
    points = this.pointsWithAbsoluteDifference(raceResult.id_4_place, fantaVote.id_4_place) + points;
    points = this.pointsWithAbsoluteDifference(raceResult.id_5_place, fantaVote.id_5_place) + points;
    points = this.pointsWithAbsoluteDifference(raceResult.id_6_place, fantaVote.id_6_place) + points;
    points = (raceResult.id_fast_lap === fantaVote.id_fast_lap && fantaVote.id_fast_lap != 0) ? points + this.CORRECT_RESPONSE_FAST_LAP_POINTS : points;
    points = (this.isDnfCorrect(raceResult.list_dnf, fantaVote.id_dnf) && fantaVote.id_dnf != 0) ? points + this.CORRECT_RESPONS_DNF_POINTS : points;

    return points;
  }

  getCorrectResponsePointFastLap(): number {
    return this.CORRECT_RESPONSE_FAST_LAP_POINTS;
  }

  getCorrectResponsePointDnf(): number {
    return this.CORRECT_RESPONS_DNF_POINTS;
  }

  isDnfCorrect(raceResultDnf: string, fantaVoteDnfId: number) {
    let fantaVoteDnfUsername: string = this.allDrivers.find(driver => driver.driver_id == fantaVoteDnfId)?.driver_username;
    return raceResultDnf.includes(fantaVoteDnfUsername);
  }

  pointsWithAbsoluteDifference(raceResult: number, fantaVote: number) : number{
    if(raceResult === 0 || fantaVote ===0) return 0
    let absDiff = Math.abs(raceResult - fantaVote);
    return this.CORRET_RESPONSE_POINTS[absDiff] == undefined ? 0 : this.CORRET_RESPONSE_POINTS[absDiff]
  }
  
  
  
}
