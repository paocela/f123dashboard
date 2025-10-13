import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';    
import { FormsModule, NgForm } from '@angular/forms';
import { AccordionComponent, 
    AccordionItemComponent, 
    FormModule, 
    SharedModule,
    ButtonDirective, 
    TemplateIdDirective,
    AccordionButtonDirective,
    TableDirective,
    AvatarComponent,
    UtilitiesModule,
    BadgeComponent} from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import { GridModule } from '@coreui/angular';
import { DbDataService } from './../../service/db-data.service';
import { FantaService } from './../../service/fanta.service';
import { cilX, cilCheckAlt, cilSwapVertical } from '@coreui/icons';
import { cilFire, cilPowerStandby, cilPeople } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { Fanta, RaceResult, VoteStatus, VOTE_INDEX, FORM_STATUS, DRIVER_POSITIONS_COUNT, TOTAL_VOTE_FIELDS, FantaVoteHelper } from '../../model/fanta';
import { medals, allFlags, posizioni } from '../../model/constants';
import { LeaderboardComponent } from "../../components/leaderboard/leaderboard.component";
import {
  ButtonCloseDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ThemeDirective
} from '@coreui/angular';
import { User } from '../../model/auth';
import { TrackData } from '../../model/track';

@Component({
    selector: 'app-fanta',
    imports: [
        CommonModule,
        FormsModule,
        FormModule,
        ButtonDirective,
        GridModule,
        SharedModule,
        AccordionComponent,
        AccordionItemComponent,
        TemplateIdDirective,
        AccordionButtonDirective,
        IconDirective,
        DatePipe,
        TableDirective,
        AvatarComponent,
        UtilitiesModule,
        BadgeComponent,
        LeaderboardComponent,
        ModalComponent, ModalHeaderComponent, ModalTitleDirective, ThemeDirective, ButtonCloseDirective, ModalBodyComponent
    ],
    templateUrl: './fanta.component.html',
    styleUrl: './fanta.component.scss'
})
export class FantaComponent {
  // Form submission status per track (uses FORM_STATUS constants)
  formStatus: Record<number, number> = {};
  forms: Record<number, NgForm> = {};
  
  user!: User;
  userFantaPoints: number = 0;
  piloti: any[] = [];
  tracks: any[] = [];
  constructors = new Map<number, string>();
  nextTracks: any[] = [];
  previusTracks: any[] = [];
  
  // Maps track ID to vote array [place1-8, fastLap, dnf, constructor]
  votazioni = new Map<number, number[]>();
  // Store original loaded data for change detection
  originalVotazioni = new Map<number, number[]>();
  
  public modalRankingVisible = false;

  public fireIcon: string[] = cilFire;
  public powerIcon: string[] = cilPowerStandby;
  public teamIcon: string[] = cilPeople;
  public posizioni = posizioni;
  public medals = medals;
  public allFlags = allFlags;
  

  constructor(public authService: AuthService, private dbData: DbDataService, public fantaService: FantaService){}

  ngOnInit(): void {
    
    const userString = sessionStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) as User : {} as User;

    this.piloti  = this.dbData.getAllDrivers();
    this.tracks = this.dbData.getAllTracks();
    this.userFantaPoints = this.fantaService.getFantaPoints(this.user.id);
    this.dbData.getConstructors().forEach(constructor => {
      this.constructors.set(constructor.constructor_id, constructor.constructor_name);
    });
    this.nextTracks = this.tracks
    .filter(item => {
      const today = new Date();  
      const itemDate = new Date(item.date);
      return itemDate > today;
    })
      .slice(0,4);

    this.previusTracks = this.tracks
        .filter(item => {
      const today = new Date();
      const itemDate = new Date(item.date);
      return itemDate <= today;
    })

    /**
     * Applies previously saved vote data to a track.
     */
    const applyPreviousVote = (track: any) => {
      if (!this.user?.id) return;
      
      const previousVote = this.fantaService.getFantaVote(this.user.id, track.track_id);
      if (!previousVote) return;
      
      // Convert Fanta object to array using helper
      const previousVoteArray = Array.from(FantaVoteHelper.toArray(previousVote));
      
      this.votazioni.set(track.track_id, previousVoteArray);
      // Store a copy of the original data for comparison
      this.originalVotazioni.set(track.track_id, [...previousVoteArray]);
    };

    this.previusTracks.forEach(applyPreviousVote);
    this.nextTracks.forEach(applyPreviousVote);

  }

  /**
   * Publishes a vote for a specific track.
   * @param trackId The track identifier
   * @param form The form reference for validation
   */
  async publishVoto(trackId: number, form: NgForm): Promise<void> {
    this.forms[trackId] = form;
    
    if (!this.formIsValid(trackId) || !this.user?.id) {
      this.formStatus[trackId] = FORM_STATUS.VALIDATION_ERROR;
      return;
    }

    const votes = this.votazioni.get(trackId) || [];
    const fantaVoto: Fanta = {
      fanta_player_id: this.user.id,
      username: this.user.username,
      track_id: trackId,
      id_1_place: votes[VOTE_INDEX.PLACE_1],
      id_2_place: votes[VOTE_INDEX.PLACE_2],
      id_3_place: votes[VOTE_INDEX.PLACE_3],
      id_4_place: votes[VOTE_INDEX.PLACE_4],
      id_5_place: votes[VOTE_INDEX.PLACE_5],
      id_6_place: votes[VOTE_INDEX.PLACE_6],
      id_7_place: votes[VOTE_INDEX.PLACE_7],
      id_8_place: votes[VOTE_INDEX.PLACE_8],
      id_fast_lap: votes[VOTE_INDEX.FAST_LAP],
      id_dnf: votes[VOTE_INDEX.DNF],
      constructor_id: votes[VOTE_INDEX.CONSTRUCTOR]
    };
    
    try {
      await this.dbData.setFantaVoto(fantaVoto);
      this.formStatus[trackId] = FORM_STATUS.SUCCESS;
      // Update the original votazioni to reflect the saved state
      const currentVotes = this.votazioni.get(trackId);
      if (currentVotes) {
        this.originalVotazioni.set(trackId, [...currentVotes]);
      }
    } catch (error) {
      console.error('Error saving fantasy vote:', error);
      this.formStatus[trackId] = FORM_STATUS.SAVE_ERROR;
    }
  }

  /**
   * Validates if a vote form is complete and valid.
   * @param trackId The track identifier
   * @returns true if form is valid, false otherwise
   */
  formIsValid(trackId: number): boolean {
    const votoArray = this.votazioni.get(trackId) || [];
    
    // Check if all required fields are present
    if (votoArray.length < TOTAL_VOTE_FIELDS) {
      return false;
    }
    
    // Check for empty votes in all required positions
    const hasEmptyVotes = votoArray.some((v, i) => i <= VOTE_INDEX.CONSTRUCTOR && v == 0);
    if (hasEmptyVotes) return false;
    
    // Check for duplicates only in driver positions (indices 0-7)
    const driverVotes = votoArray.slice(0, DRIVER_POSITIONS_COUNT);
    const hasDuplicates = driverVotes.some((v, i) => driverVotes.indexOf(v) !== i);
    
    return !hasDuplicates;
  }

  /**
   * Gets a specific vote value for a track.
   * @param trackId The track identifier
   * @param index 1-based index (1-11)
   * @returns The vote value or 0 if not found
   */
  getVoto(trackId: number, index: number): number {
    const votoArray = this.votazioni.get(trackId) || [];
    return votoArray[index - 1] || 0;
  }

  /**
   * Gets the position where a driver was voted.
   * @param trackId The track identifier
   * @param pilota The driver ID
   * @returns The position (1-8) or 0 if not found
   */
  getVotoPos(trackId: number, pilota: number): number {
    const votoArray = this.votazioni.get(trackId) || [];
    const posizione = votoArray.indexOf(pilota);
    return posizione >= 0 ? posizione + 1 : 0;
  }

  /**
   * Gets all votes for a track.
   * @param trackId The track identifier
   * @returns Array of votes or undefined
   */
  getVoti(trackId: number): number[] | undefined { 
    return this.votazioni.get(trackId);
  }
  
  /**
   * Sets a specific vote value for a track.
   * @param trackId The track identifier
   * @param index 1-based index (1-11)
   * @param valore The vote value
   * @param form The form reference
   */
  setVoto(trackId: number, index: number, valore: number, form: NgForm): void {
    this.forms[trackId] = form;
    
    if (!valore) return;
    
    let votoArray = this.votazioni.get(trackId);
    if (!votoArray) {
      votoArray = [];
      this.votazioni.set(trackId, votoArray);
    }
    
    votoArray[index - 1] = +valore;
    
    // Reset form status when data is changed, so user knows they need to save
    if (this.formStatus[trackId] === FORM_STATUS.SUCCESS) {
      delete this.formStatus[trackId];
    }
  }

  getPilota(id: number): any | null{
    return this.piloti.find(driver => driver.driver_id === id.toString()) || null;
  }

  getConstructor(id: number): string | null{
    return this.constructors.get(id) || null;
  }

  getPosizioneArrivo(pilota: number, trackId: number): number{
    const result: RaceResult | undefined = this.fantaService.getRaceResult(trackId);
    if (result){
      if (result.id_1_place == pilota) return 1;
      if (result.id_2_place == pilota) return 2;
      if (result.id_3_place == pilota) return 3;
      if (result.id_4_place == pilota) return 4;
      if (result.id_5_place == pilota) return 5;
      if (result.id_6_place == pilota) return 6;
      if (result.id_7_place == pilota) return 7;
      if (result.id_8_place == pilota) return 8;
    }
    return 0;
  }

  getFastLap(trackId: number): number {
    trackId = Number(trackId);
    const result: RaceResult | undefined = this.fantaService.getRaceResult(trackId);
    if ( result ) return result.id_fast_lap;
    return 0;
  }

  getDnf(trackId: number): string {
    trackId = Number(trackId);
    const result: RaceResult | undefined = this.fantaService.getRaceResult(trackId);
    if ( result ) return result.list_dnf;
    return "";
  }

  getPunti(pilota: number, trackId: number): number {
    const posizioneReale: number = this.getPosizioneArrivo(pilota, trackId); // Posizione effettiva del pilota
    const posizioneVotata: number = this.getVotoPos(trackId, pilota); // Posizione votata dall'utente per il pilota
    return posizioneReale > 0 && posizioneVotata > 0 ? this.fantaService.pointsWithAbsoluteDifference(posizioneReale, posizioneVotata) : 0;
  }
  
  /**
   * Calculates points earned for fastest lap vote.
   */
  getPuntiFastLap(trackId: number): number {
    const posizioneArrivo = this.getFastLap(trackId);
    const votes = this.votazioni.get(trackId) || [];
    const votazione = votes[VOTE_INDEX.FAST_LAP];
    return votazione == posizioneArrivo && votazione !== 0 
      ? this.fantaService.getCorrectResponsePointFastLap() 
      : 0;
  }

  /**
   * Calculates points earned for DNF vote.
   */
  getPuntiDnf(trackId: number): number {    
    const listDnf = this.getDnf(trackId);
    const votes = this.votazioni.get(trackId) || [];
    const votazione = votes[VOTE_INDEX.DNF];
    return this.fantaService.isDnfCorrect(listDnf, votazione) && votazione !== 0 
      ? this.fantaService.getCorrectResponsePointDnf() 
      : 0;
  }

  /**
   * Calculates points earned for constructor vote.
   */
  getPuntiConstructor(trackId: number): number {
    const winningConstructorId = this.fantaService.getWinningConstructorForTrack(trackId);
    const votes = this.votazioni.get(trackId) || [];
    const votazione = votes[VOTE_INDEX.CONSTRUCTOR];
    return winningConstructorId == votazione && votazione !== 0 
      ? this.fantaService.getCorrectResponsePointTeam() 
      : 0;
  }

  getPuntiGp( trackId: number): number{
    return this.fantaService.getFantaRacePoints(this.user.id, trackId);
  }

  /**
   * Creates a VoteStatus object based on correctness.
   * Helper method to reduce redundancy.
   */
  private createVoteStatus(isCorrect: boolean, isPartial: boolean = false): VoteStatus {
    if (isCorrect) {
      return { icon: cilCheckAlt, color: 'green' };
    }
    if (isPartial) {
      return { icon: cilSwapVertical, color: '#FFA600' };
    }
    return { icon: cilX, color: 'red' };
  }

  /**
   * Checks if a driver position vote is correct and returns visual status.
   */
  isCorrect(pilota: number, trackId: number): VoteStatus {
    const posizioneReale = this.getPosizioneArrivo(pilota, trackId);
    const posizioneVotata = this.getVotoPos(trackId, pilota);
    
    if (posizioneReale === 0 || posizioneVotata === 0) {
      return this.createVoteStatus(false);
    }
    
    const punti = this.fantaService.pointsWithAbsoluteDifference(posizioneReale, posizioneVotata);
    
    // Check if it's a perfect match
    if (punti === FantaService.CORRECT_RESPONSE_POINTS[0]) {
      return this.createVoteStatus(true);
    }
    
    // Check if it's a partial match (off by 1 or 2)
    if (punti === FantaService.CORRECT_RESPONSE_POINTS[1] || 
        punti === FantaService.CORRECT_RESPONSE_POINTS[2]) {
      return this.createVoteStatus(false, true);
    }
    
    return this.createVoteStatus(false);
  }

  /**
   * Checks if fastest lap vote is correct and returns visual status.
   */
  isCorrectFastLap(trackId: number): VoteStatus {
    const actualFastLap = this.getFastLap(trackId);
    const votes = this.votazioni.get(trackId) || [];
    const votedFastLap = votes[VOTE_INDEX.FAST_LAP];
    
    return this.createVoteStatus(votedFastLap == actualFastLap && votedFastLap !== 0);
  }

  /**
   * Checks if DNF vote is correct and returns visual status.
   */
  isCorrectDnf(trackId: number): VoteStatus {
    const dnfList = this.getDnf(trackId);
    const votes = this.votazioni.get(trackId) || [];
    const votedDnf = votes[VOTE_INDEX.DNF];
    
    return this.createVoteStatus(this.fantaService.isDnfCorrect(dnfList, votedDnf));
  }

  /**
   * Checks if constructor vote is correct and returns visual status.
   */
  isCorrectConstructor(trackId: number): VoteStatus {
    const winningConstructorId = this.fantaService.getWinningConstructorForTrack(trackId);
    const votes = this.votazioni.get(trackId) || [];
    const votedConstructor = votes[VOTE_INDEX.CONSTRUCTOR];
    
    return this.createVoteStatus(
      winningConstructorId === votedConstructor && votedConstructor !== 0
    );
  }

  toggleModalRanking() {
    this.modalRankingVisible = !this.modalRankingVisible;
  }

  /**
   * Checks if there are unsaved changes for a track.
   */
  hasUnsavedData(trackId: number): boolean {
    const currentVotes = this.votazioni.get(trackId) || [];
    const originalVotes = this.originalVotazioni.get(trackId) || [];
    
    // If form was just saved successfully, no unsaved data
    if (this.formStatus[trackId] === FORM_STATUS.SUCCESS) {
      return false;
    }
    
    // Check if there are any votes entered
    const hasVotes = currentVotes.some(vote => vote && vote > 0);
    
    // If no votes at all, no unsaved data
    if (!hasVotes)  return false;
    
    // If there are no original votes but current votes exist, it's unsaved
    if (originalVotes.length === 0) return true;
    
    // Compare current votes with original votes
    if (currentVotes.length !== originalVotes.length) return true;
    
    // Check if any vote has changed
    return currentVotes.some((vote, i) => vote !== originalVotes[i]);
  }

  /**
   * Checks if no vote data exists for a track.
   */
  hasNoData(trackId: number): boolean {
    const currentVotes = this.votazioni.get(trackId) || [];
    
    // If form is already saved, don't show "Votazione Mancante"
    if (this.formStatus[trackId] === FORM_STATUS.SUCCESS) {
      return false;
    }
    
    // Show "Votazione Mancante" if no votes are entered at all
    const hasAnyVotes = currentVotes.some(vote => vote && vote > 0);
    return !hasAnyVotes;
  }
  
  get avatarSrc(): string {
    return this.dbData.getAvatarSrc(this.user);
  }

}
