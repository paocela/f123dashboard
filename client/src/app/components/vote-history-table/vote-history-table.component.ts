import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { TableDirective, AvatarComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilPeople, cilCheckAlt, cilX, cilSwapVertical } from '@coreui/icons';
import { FantaService } from '../../service/fanta.service';
import { DbDataService } from '../../service/db-data.service';
import { FantaVote, RaceResult } from '@genezio-sdk/f123dashboard';
import { VoteStatus, VOTE_INDEX } from '../../model/fanta';

@Component({
  selector: 'app-vote-history-table',
  standalone: true,
  imports: [
    CommonModule,
    TableDirective,
    IconDirective,
    AvatarComponent
  ],
  templateUrl: './vote-history-table.component.html',
  styleUrl: './vote-history-table.component.scss'
})
export class VoteHistoryTableComponent {
  fantaService = inject(FantaService);
  private dbData = inject(DbDataService);

  @Input() fantaVote!: FantaVote;
  @Input() trackId!: number;
  @Input() showTotalPoints = true;

  public cilPeople: string[] = cilPeople;
  public cilCheckAlt: string[] = cilCheckAlt;
  public cilX: string[] = cilX;
  public cilSwapVertical: string[] = cilSwapVertical;

  /**
   * Get vote array from FantaVote object
   */
  getVoteArray(): number[] {
    if (!this.fantaVote) {return [];}
    
    return [
      this.fantaVote.id_1_place,
      this.fantaVote.id_2_place,
      this.fantaVote.id_3_place,
      this.fantaVote.id_4_place,
      this.fantaVote.id_5_place,
      this.fantaVote.id_6_place,
      this.fantaVote.id_7_place,
      this.fantaVote.id_8_place,
      this.fantaVote.id_fast_lap,
      this.fantaVote.id_dnf,
      this.fantaVote.constructor_id
    ];
  }

  getPilota(id: number): any | null {
    return this.dbData.getAllDrivers().find(driver => +driver.driver_id === +id) || null;
  }

  getConstructor(id: number): string | null {
    const constructor = this.dbData.getConstructors().find(c => c.constructor_id === id);
    return constructor?.constructor_name || null;
  }

  getPosizioneArrivo(pilotaId: number): number {
    const result = this.fantaService.getRaceResult(this.trackId);
    if (!result) {return 0;}
    
    const positions = [
      result.id_1_place, result.id_2_place, result.id_3_place, result.id_4_place,
      result.id_5_place, result.id_6_place, result.id_7_place, result.id_8_place
    ];
    
    const position = positions.findIndex(id => +id === +pilotaId);
    return position >= 0 ? position + 1 : 0;
  }

  getVotoPos(pilotaId: number): number {
    const voteArray = this.getVoteArray();
    const position = voteArray.slice(0, 8).findIndex(id => +id === +pilotaId);
    return position >= 0 ? position + 1 : 0;
  }

  getPunti(pilotaId: number): number {
    const posizioneReale = this.getPosizioneArrivo(pilotaId);
    const posizioneVotata = this.getVotoPos(pilotaId);
    
    if (posizioneReale === 0 || posizioneVotata === 0) 
      {return 0;}
    
    
    // Both positions are 1-based (1-8), pass as-is to match service method usage
    return this.fantaService.pointsWithAbsoluteDifference(posizioneReale, posizioneVotata);
  }

  getPuntiFastLap(): number {
    const result = this.fantaService.getRaceResult(this.trackId);
    if (!result) {return 0;}
    
    return +result.id_fast_lap === +this.fantaVote.id_fast_lap && this.fantaVote.id_fast_lap !== 0
      ? this.fantaService.getCorrectResponsePointFastLap()
      : 0;
  }

  getPuntiDnf(): number {
    const result = this.fantaService.getRaceResult(this.trackId);
    if (!result) {return 0;}
    
    return this.fantaService.isDnfCorrect(result.list_dnf, this.fantaVote.id_dnf) && this.fantaVote.id_dnf !== 0
      ? this.fantaService.getCorrectResponsePointDnf()
      : 0;
  }

  getPuntiConstructor(): number {
    const winningConstructorId = this.fantaService.getWinningConstructorForTrack(this.trackId);
    if (!winningConstructorId) {return 0;}
    
    return +winningConstructorId === +this.fantaVote.constructor_id && this.fantaVote.constructor_id !== 0
      ? this.fantaService.getCorrectResponsePointTeam()
      : 0;
  }

  getTotalPoints(): number {
    return this.fantaService.getFantaRacePoints(this.fantaVote.fanta_player_id, this.trackId);
  }

  isCorrect(pilotaId: number): VoteStatus {
    const posizioneReale = this.getPosizioneArrivo(pilotaId);
    const posizioneVotata = this.getVotoPos(pilotaId);
    
    if (posizioneReale === 0 || posizioneVotata === 0) 
      {return { icon: cilX, color: 'red' };}
    
    
    const punti = this.fantaService.pointsWithAbsoluteDifference(posizioneReale, posizioneVotata);
    
    if (punti === FantaService.CORRECT_RESPONSE_POINTS[0]) 
      {return { icon: cilCheckAlt, color: 'green' };}
    
    
    if (punti === FantaService.CORRECT_RESPONSE_POINTS[1] || 
        punti === FantaService.CORRECT_RESPONSE_POINTS[2]) 
      {return { icon: cilSwapVertical, color: '#FFA600' };}
    
    
    return { icon: cilX, color: 'red' };
  }

  isCorrectFastLap(): VoteStatus {
    const result = this.fantaService.getRaceResult(this.trackId);
    if (!result) {return { icon: cilX, color: 'red' };}
    
    const isCorrect = +result.id_fast_lap === +this.fantaVote.id_fast_lap && this.fantaVote.id_fast_lap !== 0;
    return isCorrect 
      ? { icon: cilCheckAlt, color: 'green' }
      : { icon: cilX, color: 'red' };
  }

  isCorrectDnf(): VoteStatus {
    const result = this.fantaService.getRaceResult(this.trackId);
    if (!result) {return { icon: cilX, color: 'red' };}
    
    const isCorrect = this.fantaService.isDnfCorrect(result.list_dnf, this.fantaVote.id_dnf);
    return isCorrect 
      ? { icon: cilCheckAlt, color: 'green' }
      : { icon: cilX, color: 'red' };
  }

  isCorrectConstructor(): VoteStatus {
    const winningConstructorId = this.fantaService.getWinningConstructorForTrack(this.trackId);
    if (!winningConstructorId) {return { icon: cilX, color: 'red' };}
    
    const isCorrect = +winningConstructorId === +this.fantaVote.constructor_id && this.fantaVote.constructor_id !== 0;
    return isCorrect 
      ? { icon: cilCheckAlt, color: 'green' }
      : { icon: cilX, color: 'red' };
  }

  getFastLap(): number {
    const result = this.fantaService.getRaceResult(this.trackId);
    return result?.id_fast_lap || 0;
  }

  getDnf(): string {
    const result = this.fantaService.getRaceResult(this.trackId);
    return result?.list_dnf || '';
  }
}
