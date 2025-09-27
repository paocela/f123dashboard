import { DatePipe, NgIf } from '@angular/common';
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
import { cilFire, cilPowerStandby } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { Fanta, RaceResult } from '../../model/fanta';
import { medals, allFlags, posizioni } from '../../model/constants';
import { LeaderboardComponent } from "../../components/leaderboard/leaderboard.component";
import {
  ButtonCloseDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ThemeDirective
} from '@coreui/angular';
import { User } from '../../model/auth';


interface voteStatus {
  icon: any;
  color: string;
}

@Component({
    selector: 'app-fanta',
    imports: [
        NgIf,
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
  // 1 = success, 2 = error
  formStatus: { [key: number]: number } = {};
  forms: { [key: number]: NgForm } = {};
  user!: User;
  userFantaPoints: number = 0;
  piloti: any[] = [];
  tracks: any[] = [];
  nextTracks: any[] = [];
  previusTracks: any[] = [];
  //voto: number[] = [];
  votazioni: Map<number, number[]> = new Map<number, number[]>();
  originalVotazioni: Map<number, number[]> = new Map<number, number[]>(); // Store original loaded data
  public modalRankingVisible = false;

  public fireIcon: string[] = cilFire;
  public powerIcon: string[] = cilPowerStandby;
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

    const applyPreviousVote = (track: any) => {
      const previousVote: Fanta | undefined = this.user?.id ? this.fantaService.getFantaVote(this.user.id, track.track_id) : undefined;
      if (previousVote) {
      const previousVoteArray = [
        this.toNumber(previousVote.id_1_place),
        this.toNumber(previousVote.id_2_place),
        this.toNumber(previousVote.id_3_place),
        this.toNumber(previousVote.id_4_place),
        this.toNumber(previousVote.id_5_place),
        this.toNumber(previousVote.id_6_place),
        this.toNumber(previousVote.id_7_place),
        this.toNumber(previousVote.id_8_place),
        this.toNumber(previousVote.id_fast_lap),
        this.toNumber(previousVote.id_dnf)
      ];
      this.votazioni.set(track.track_id, previousVoteArray);
      // Store a copy of the original data for comparison
      this.originalVotazioni.set(track.track_id, [...previousVoteArray]);
      }
    };

    this.previusTracks.forEach(applyPreviousVote);
    this.nextTracks.forEach(applyPreviousVote);

  }

  toNumber(n: any): number{
    return  isNaN(+n) ? 0 : +n;
  }

  publishVoto(trackId: number, form: NgForm): void {
    this.forms[trackId]= form;
    if(this.formIsValid(trackId) && this.user?.id){
      let fantaVoto: Fanta = {
        fanta_player_id: this.user.id,
        username: this.user.username,
        id_1_place: this.getVoto(trackId, 1),
        id_2_place: this.getVoto(trackId, 2),
        id_3_place: this.getVoto(trackId, 3),
        id_4_place: this.getVoto(trackId, 4),
        id_5_place: this.getVoto(trackId, 5),
        id_6_place: this.getVoto(trackId, 6),
        id_7_place: this.getVoto(trackId, 7),
        id_8_place: this.getVoto(trackId, 8),
        id_fast_lap: this.getVoto(trackId, 9),
        id_dnf: this.getVoto(trackId, 10),
        track_id: trackId,
      };
      console.log(JSON.stringify(fantaVoto));
      this.dbData.setFantaVoto(fantaVoto);
      this.formStatus[trackId] = 1;
      // Update the original votazioni to reflect the saved state
      const currentVotes = this.votazioni.get(trackId);
      if (currentVotes) {
        this.originalVotazioni.set(trackId, [...currentVotes]);
      }
    } else {
      this.formStatus[trackId] = 2;
    }
  }

  formIsValid(trackId: number): boolean {
    const votoArray = this.votazioni.get(trackId) || [];
    const hasDuplicates = votoArray.some((v, i) => i <= 7 && votoArray.indexOf(v) !== i);
    const hasEmptyVotes = votoArray.some((v, i)=> v == 0);
    if(hasDuplicates || hasEmptyVotes || votoArray.length < 7){
      return false;
    }
    return true;
  }

  getVoto(trackId: number, index: number): number {
    const votoArray = this.votazioni.get(trackId) || [];
    return votoArray[index-1] || 0;
  }

  getVotoPos(trackId: number, pilota: number): number {
    const votoArray = this.votazioni.get(trackId) || [];
    const posizione = votoArray.indexOf(pilota); // Trova la posizione del pilota nell'array
    return posizione >= 0 ? posizione + 1 : 0; // Restituisce la posizione (indice + 1) o 0 se non trovato
  }

  getVoti(trackId: number): number[] | undefined{ 
    return this.votazioni.get(trackId);
  }
  
  setVoto(trackId: number, index: number, valore: number, form: NgForm): void {
    this.forms[trackId]= form;
    if(valore){
      let votoArray = this.votazioni.get(trackId);
      if (!votoArray) {
        votoArray = [];
        this.votazioni.set(trackId, votoArray);
      }
      votoArray[index-1] = +valore;
      
      // Reset form status when data is changed, so user knows they need to save
      if (this.formStatus[trackId] === 1) {
        delete this.formStatus[trackId];
      }
    }
  }

  getPilota(id: number): any | null{
    return this.piloti.find(driver => driver.driver_id === id.toString()) || null;
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
    const result: RaceResult | undefined = this.fantaService.getRaceResult(trackId);
    if ( result ){
      return result.id_fast_lap;
    }
    return 0;
  }

  getDnf(trackId: number): string {
    const result: RaceResult | undefined = this.fantaService.getRaceResult(trackId);
    if ( result ){
      return result.list_dnf;
    }
    return "";
  }

  getPunti(pilota: number, trackId: number): number {
    const posizioneReale: number = this.getPosizioneArrivo(pilota, trackId); // Posizione effettiva del pilota
    const posizioneVotata: number = this.getVotoPos(trackId, pilota); // Posizione votata dall'utente per il pilota
    return this.fantaService.pointsWithAbsoluteDifference(posizioneReale, posizioneVotata);
  }
  
  getPuntiFastLap(trackId: number): number{
    let posizioneArrivo: number = this.getFastLap(trackId);
    let votazione: number = this.getVoto(trackId, 9); // 9 is giro veloce
    return votazione == posizioneArrivo && votazione != 0 ? this.fantaService.getCorrectResponsePointFastLap() : 0;  
  }

  getPuntiDnf(trackId: number): number {
    let listDnf: string = this.getDnf(trackId);
    let votazione: number = this.getVoto(trackId, 10); // 10 is dnf
    return this.fantaService.isDnfCorrect(listDnf, votazione) && votazione != 0 ? this.fantaService.getCorrectResponsePointDnf() : 0;
  }

  getPuntiGp( trackId: number): number{
    let punti: number = 0;
    for (let i: number = 1; i <= 8; i++) {
      punti += this.getPunti(i, trackId);
    }
    punti += this.getPuntiFastLap(trackId);
    punti += this.getPuntiDnf(trackId);
    return punti;
  }

  isCorrect(pilota: number, trackId: number): voteStatus {
    let posizioneReale: number = this.getPosizioneArrivo(pilota, trackId);
    let posizioneVotata: number = this.getVotoPos(trackId, pilota);
    let punti_fatti = this.fantaService.pointsWithAbsoluteDifference(posizioneReale, posizioneVotata)
    let status: voteStatus = {
      icon: cilX,
      color: 'red'
    };

    if (punti_fatti == 7){
      status.icon = cilCheckAlt;
      status.color = 'green';
    } else if (punti_fatti == 4 ) {
      status.icon = cilSwapVertical;
      status.color = '#FFA600';
    } else if (punti_fatti == 2) {
      status.icon = cilSwapVertical;
      status.color = '#FFA600';
    } else {
      status.icon = cilX;
      status.color = 'red';
    }
    return status;
  }

  isCorrectFastLap(trackId: number): voteStatus {
    let pilota: number = this.getFastLap(trackId);
    let votazione: number = this.getVoto(trackId, 7);
    let status: voteStatus = {
      icon: cilX,
      color: 'red'
    };

    if (votazione == pilota){
      status.icon = cilCheckAlt;
      status.color = 'green';
    } else {
      status.icon = cilX;
      status.color = 'red';
    }
    return status;
  }

  isCorrectDnf(trackId: number): voteStatus {
    let pilotaList: string = this.getDnf(trackId);
    let votazione: number = this.getVoto(trackId, 8);
    let status: voteStatus = {
      icon: cilX,
      color: 'red'
    };

    if (this.fantaService.isDnfCorrect(pilotaList, votazione))
    {
      status.icon = cilCheckAlt;
      status.color = 'green';
    } else {
      status.icon = cilX;
      status.color = 'red';
    }
    return status;
  }

  toggleModalRanking() {
    this.modalRankingVisible = !this.modalRankingVisible;
  }

  hasUnsavedData(trackId: number): boolean {
    // Get current votes and original votes
    const currentVotes = this.votazioni.get(trackId) || [];
    const originalVotes = this.originalVotazioni.get(trackId) || [];
    
    // If form status is success (1), no unsaved data
    if (this.formStatus[trackId] === 1) {
      return false;
    }
    
    // Check if there are any votes entered
    const hasVotes = currentVotes.some(vote => vote && vote > 0);
    
    // If no votes at all, no unsaved data
    if (!hasVotes) {
      return false;
    }
    
    // If there are no original votes but current votes exist, it's unsaved
    if (originalVotes.length === 0) {
      return true;
    }
    
    // Compare current votes with original votes
    if (currentVotes.length !== originalVotes.length) {
      return true;
    }
    
    // Check if any vote has changed
    for (let i = 0; i < currentVotes.length; i++) {
      if (currentVotes[i] !== originalVotes[i]) {
        return true;
      }
    }
    
    return false;
  }

  hasNoData(trackId: number): boolean {
    // Get current votes
    const currentVotes = this.votazioni.get(trackId) || [];
    
    // If form is already saved, don't show "Votazione Mancante"
    if (this.formStatus[trackId] === 1) {
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
