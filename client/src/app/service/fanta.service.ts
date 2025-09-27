import { Injectable, OnDestroy } from '@angular/core';
import { DbDataService } from './db-data.service';
import { Fanta, RaceResult } from '../model/fanta';
import { size } from 'lodash-es';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FantaService implements OnDestroy {
  fantaPoints: Map<number,number> = new Map<number,number>(); // track fanta point per player
  fantaNumberVotes: Map<number, number> = new Map<number, number>(); // track how many times a fanta player voted out of all possible votes
  fantaVotes:  Fanta[] = [];
  raceResults: RaceResult[] = [];
  allDrivers: any[] = [];
  private subscription: Subscription = new Subscription();

  CORRECT_RESPONSE_FAST_LAP_POINTS: number = 5;
  CORRECT_RESPONS_DNF_POINTS: number = 5;
  CORRET_RESPONSE_POINTS: Readonly<Record<number, number>> = {
    0: 7,
    1: 4,
    2: 2
  };


  constructor(private dbData: DbDataService) {
    this.initializeData();
    
    // Subscribe to fantaVote changes directly
    this.subscription.add(
      this.dbData.fantaVote$.subscribe((fantaVotes: Fanta[]) => {
        this.fantaVotes = fantaVotes;
        this.calculatePoints();
      })
    );
   }

   private initializeData(): void {
    this.fantaVotes = this.dbData.getFantaVote();
    this.raceResults = this.dbData.getRaceResoult();
    this.allDrivers = this.dbData.getAllDrivers();

    this.calculatePoints();
   }

   private calculatePoints(): void {
    // Clear existing data
    this.fantaPoints.clear();
    this.fantaNumberVotes.clear();

    this.raceResults.forEach(raceResult => {
      const raceVotes = this.fantaVotes.filter(item => item.track_id == raceResult.track_id);
      raceVotes.forEach(raceVote => {
        const racePoints: number =  this.calculateFantaPoints(raceResult, raceVote);
        this.fantaNumberVotes.set(Number(raceVote.fanta_player_id), (this.fantaNumberVotes.get(Number(raceVote.fanta_player_id)) ?? 0) + 1);
        this.fantaPoints.set(Number(raceVote.fanta_player_id), (this.fantaPoints.get(Number(raceVote.fanta_player_id)) ?? 0) + racePoints);
      });
    });

    //order by points
    this.fantaPoints = new Map(Array.from(this.fantaPoints.entries()).sort(([, valueA], [, valueB]) => valueA - valueB));
   }

   getFantaPoints(userId: number): number{
    return this.fantaPoints.get(Number(userId)) ?? 0;
   }

   getFantaNumberVotes(userId: number): number {
    return this.fantaNumberVotes.get(Number(userId)) ?? 0;
   }

   getTotNumberVotes(): number {
    return size(this.raceResults) - 3;
   }

   getFantaVote( userId:number, raceId:number): Fanta | undefined {
    return this.fantaVotes.filter(vote => vote.fanta_player_id == userId)
                .find(vote => vote.track_id == raceId);
   }

   getRaceResult(raceId: number): RaceResult | undefined {
    return this.raceResults.find(race => race.track_id == raceId);
   }

   /**
    * Clean up subscriptions when service is destroyed
    */
   ngOnDestroy(): void {
     this.subscription.unsubscribe();
   }

  calculateFantaPoints(raceResult: any, fantaVote: Fanta): number {
    let points: number = 0;

    // Create arrays of positions for both result and vote
    const resultPositions = [
      raceResult.id_1_place, raceResult.id_2_place, raceResult.id_3_place, raceResult.id_4_place,
      raceResult.id_5_place, raceResult.id_6_place, raceResult.id_7_place, raceResult.id_8_place
    ];
    
    const votePositions = [
      fantaVote.id_1_place, fantaVote.id_2_place, fantaVote.id_3_place, fantaVote.id_4_place,
      fantaVote.id_5_place, fantaVote.id_6_place, fantaVote.id_7_place, fantaVote.id_8_place
    ];

    // Calculate points for each driver (1-8)
    for (let driverId = 1; driverId <= 8; driverId++) {
      const realPosition = resultPositions.indexOf(driverId) + 1; // +1 because indexOf returns 0-based
      const votedPosition = votePositions.indexOf(driverId) + 1;
      
      // Only add points if driver is found in both arrays
      if (realPosition > 0 && votedPosition > 0) {
        points += this.pointsWithAbsoluteDifference(realPosition, votedPosition);
      }
    }

    // Calculate points for Fast Lap and DNF
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
    //let fantaVoteDnfUsername: string = this.allDrivers.find(driver => driver.driver_id == fantaVoteDnfId)?.driver_username;
    //return raceResultDnf.includes(fantaVoteDnfUsername) ;
    // now list_dnf contains the driver_id, so we can check directly
    if (!raceResultDnf || !fantaVoteDnfId) return false;
    // raceResultDnf is a string like "{1,4}", so extract numbers
    const dnfStr = typeof raceResultDnf === 'string' ? raceResultDnf : String(raceResultDnf ?? '');
    const ids = dnfStr.replace(/[{}]/g, '').split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
    return ids.includes(fantaVoteDnfId);
    
  }

  pointsWithAbsoluteDifference(raceResult: number, fantaVote: number) : number{
    if(raceResult == 0 || fantaVote == 0) return 0;
    let absDiff = Math.abs(raceResult - fantaVote);
    return this.CORRET_RESPONSE_POINTS[absDiff] ?? 0;
  }
  
}
