import { Injectable, OnDestroy, inject } from '@angular/core';
import { DbDataService } from './db-data.service';
import { size } from 'lodash-es';
import { Subscription } from 'rxjs';
import type { FantaVote, RaceResult } from '@f123dashboard/shared';

@Injectable({
  providedIn: 'root'
})
export class FantaService implements OnDestroy {
  private dbData = inject(DbDataService);

  fantaPoints: Map<number,number> = new Map<number,number>(); // track fanta point per player
  fantaNumberVotes: Map<number, number> = new Map<number, number>(); // track how many times a fanta player voted out of all possible votes
  fantaRacePoints: Map<string, number> = new Map<string, number>(); // track points per race per player (key: "playerId_raceId")
  fantaVotes:  FantaVote[] = [];
  raceResults: RaceResult[] = [];
  private subscription: Subscription = new Subscription();

  public static readonly CORRECT_RESPONSE_FAST_LAP_POINTS: number = 5;
  public static readonly CORRECT_RESPONSE_DNF_POINTS: number = 5;
  public static readonly CORRECT_RESPONSE_TEAM: number = 5;
  public static readonly CORRECT_RESPONSE_POINTS: Readonly<Record<number, number>> = {
    0: 7,
    1: 4,
    2: 2
  };


  constructor() {
    this.initializeData();
    
    // Subscribe to fantaVote changes directly
    this.subscription.add(
      this.dbData.fantaVote$.subscribe((fantaVotes: FantaVote[]) => {
        this.fantaVotes = fantaVotes;
        this.calculatePoints();
      })
    );
   }

   private initializeData(): void {
    this.fantaVotes = this.dbData.getFantaVote();
    this.raceResults = this.dbData.getRaceResoult().filter(result => result.id_1_place != null);

    this.calculatePoints();
   }

   private calculatePoints(): void {
    // Clear existing data
    this.fantaPoints.clear();
    this.fantaNumberVotes.clear();
    this.fantaRacePoints.clear();


    this.raceResults.forEach(raceResult => {
      const raceVotes = this.fantaVotes.filter(item => item.track_id == raceResult.track_id && item.id_1_place != null);
      if (raceVotes.length === 0) {return;}

      raceVotes.forEach(raceVote => {
        const racePoints: number =  this.calculateFantaPoints(raceResult, raceVote);
        const playerId = Number(raceVote.fanta_player_id);
        const raceId = Number(raceResult.track_id);
        
        // Store points for this specific race and player
        const raceKey = `${playerId}_${raceId}`;
        this.fantaRacePoints.set(raceKey, racePoints);
        
        // Update total points and vote count per player
        this.fantaNumberVotes.set(playerId, (this.fantaNumberVotes.get(playerId) ?? 0) + 1);
        this.fantaPoints.set(playerId, (this.fantaPoints.get(playerId) ?? 0) + racePoints);
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

   getFantaRacePoints(userId: number, raceId: number): number {
    const raceKey = `${userId}_${raceId}`;
    return this.fantaRacePoints.get(raceKey) ?? 0;
   }

   getFantaRacePointsBreakdown(userId: number): {raceId: number, points: number}[] {
    const breakdown: {raceId: number, points: number}[] = [];
    
    this.fantaRacePoints.forEach((points, key) => {
      const [playerId, raceId] = key.split('_').map(Number);
      if (playerId === userId) 
        {breakdown.push({ raceId, points });}
      
    });
    
    return breakdown.sort((a, b) => a.raceId - b.raceId);
   }

   getTotNumberVotes(): number {
    return size(this.raceResults);
   }

   getFantaVote( userId:number, raceId:number): FantaVote | undefined {
    return this.fantaVotes.filter(vote => vote.fanta_player_id == userId)
                .find(vote => vote.track_id == raceId);
   }

   getRaceResult(raceId: number): RaceResult | undefined {
    const result = this.raceResults.find(race => race.track_id == raceId);
    return result;
   }

   /**
    * Get the winning constructor(s) for a specific track/race.
    * Returns all constructors that tied for first place with the highest points.
    */
   getWinningConstructorsForTrack(trackId: number): number[] {
    const allConstructorGpPoints = this.dbData.getConstructorGrandPrixPointsData();
    const constructorsForTrack = allConstructorGpPoints.filter(c => +c.track_id === +trackId);
    
    if (constructorsForTrack.length === 0) {
      return [];
    }
    
    // Find the maximum points for this track
    const maxPoints = Math.max(...constructorsForTrack.map(c => c.constructor_points));
    
    // Return all constructors that have the maximum points (handles ties)
    return constructorsForTrack
      .filter(c => c.constructor_points === maxPoints)
      .map(c => +c.constructor_id)
      .filter(id => id !== null && id !== undefined);
   }

   /**
    * Clean up subscriptions when service is destroyed
    */
   ngOnDestroy(): void {
     this.subscription.unsubscribe();
   }

  calculateFantaPoints(raceResult: RaceResult, fantaVote: FantaVote): number {
    let points = 0;
    // Create arrays of positions for both result and vote
    const resultPositions = [
      Number(raceResult.id_1_place), Number(raceResult.id_2_place), Number(raceResult.id_3_place), Number(raceResult.id_4_place),
      Number(raceResult.id_5_place), Number(raceResult.id_6_place), Number(raceResult.id_7_place), Number(raceResult.id_8_place)
    ];
    
    const votePositions = [
      Number(fantaVote.id_1_place), Number(fantaVote.id_2_place), Number(fantaVote.id_3_place), Number(fantaVote.id_4_place),
      Number(fantaVote.id_5_place), Number(fantaVote.id_6_place), Number(fantaVote.id_7_place), Number(fantaVote.id_8_place)
    ];
    // Calculate points for each driver (1-8)
    this.dbData.getDrivers().forEach(driver =>  {
      const realPosition = resultPositions.indexOf(Number(driver.id));
      const votedPosition = votePositions.indexOf(Number(driver.id));
      if(votedPosition == -1 || realPosition == -1) {return;}

      points += this.pointsWithAbsoluteDifference(realPosition, votedPosition);
    });

    // Calculate points for Fast Lap and DNF
    points = (raceResult.id_fast_lap == fantaVote.id_fast_lap && fantaVote.id_fast_lap != 0) ? points + FantaService.CORRECT_RESPONSE_FAST_LAP_POINTS : points;
    points = (this.isDnfCorrect(raceResult.list_dnf, fantaVote.id_dnf) && fantaVote.id_dnf != 0) ? points + FantaService.CORRECT_RESPONSE_DNF_POINTS : points;
    
    // Calculate points for Constructor Team (all tied constructors with highest points count as winners)
    const winningConstructorIds = this.getWinningConstructorsForTrack(+raceResult.track_id);
    const isConstructorWinner = winningConstructorIds.includes(fantaVote.constructor_id) && fantaVote.constructor_id != 0;
    points = isConstructorWinner ? points + FantaService.CORRECT_RESPONSE_TEAM : points;

    return points;
  }

  getCorrectResponsePointFastLap(): number {
    return FantaService.CORRECT_RESPONSE_FAST_LAP_POINTS;
  }

  getCorrectResponsePointDnf(): number {
    return FantaService.CORRECT_RESPONSE_DNF_POINTS;
  }

  getCorrectResponsePointTeam(): number {
    return FantaService.CORRECT_RESPONSE_TEAM;
  }

  isDnfCorrect(raceResultDnf: string, fantaVoteDnfId: number) {
    //let fantaVoteDnfUsername: string = this.allDrivers.find(driver => driver.driver_id == fantaVoteDnfId)?.driver_username;
    //return raceResultDnf.includes(fantaVoteDnfUsername) ;
    // now list_dnf contains the driver_id, so we can check directly
    if (!raceResultDnf || !fantaVoteDnfId) {return false;}
    // raceResultDnf is a string like "{1,4}", so extract numbers
    const dnfStr = typeof raceResultDnf === 'string' ? raceResultDnf : String(raceResultDnf ?? '');
    const ids = dnfStr.replace(/[{}]/g, '').split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
    return ids.includes(+fantaVoteDnfId);
    
  }

  pointsWithAbsoluteDifference(raceResult: number, fantaVote: number) : number{
    const absDiff = Math.abs(raceResult - fantaVote);
    return FantaService.CORRECT_RESPONSE_POINTS[absDiff] ?? 0;
  }
  
}
