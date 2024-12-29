import { DatePipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';    
import { FormsModule } from '@angular/forms';
import { AccordionComponent, 
    AccordionItemComponent, 
    FormModule, 
    SharedModule,
    ButtonDirective, 
    TemplateIdDirective,
    AccordionButtonDirective,
    TableDirective,
    AvatarComponent,
    UtilitiesModule} from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import { GridModule } from '@coreui/angular';
import { DbDataService } from 'src/app/service/db-data.service';
import { FantaService } from 'src/app/service/fanta.service';
import { cifAe, cifAt, cifAu, cifAz, cifBe, cifBh, cifBr, cifCa, cifCn, cifEs, cifGb, cifHu, cifIt, 
    cifJp, cifMc, cifMx, cifNl, cifQa, cifSa, cifSg, cifUs, cilXCircle, cilCheckCircle } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { Fanta, RaceResult } from '../../model/fanta';
import { rest } from 'lodash-es';

interface voteStatus {
  icon: any;
  color: string;
}

@Component({
  selector: 'app-fanta',
  standalone: true,
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
    UtilitiesModule
],
  templateUrl: './fanta.component.html',
  styleUrl: './fanta.component.scss'
})
export class FantaComponent {
  errorMessage: string = '';
  username: string  = '';
  userId!: number;
  userFantaPoints: number = 0;
  piloti: any[] = [];
  tracks: any[] = [];
  nextTracks: any[] = [];
  previusTracks: any[] = [];
  //voto: number[] = [];
  votazioni: Map<number, number[]> = new Map<number, number[]>();
  
  posizioni = new Map<number, string>([
    [1, "primo"],
    [2, "secondo"],
    [3, "terzo"],
    [4, "quarto"],
    [5, "quinto"],
    [6, "sesto"]
  ]);

  medals = new Map<number, string>([
    [1, "medal_first.png"],
    [2, "medal_second.png"],
    [3, "medal_third.png"]
  ]);

  public allFlags: {[key: string]: any} = {
    "Barhain": cifBh,
    "Arabia Saudita": cifSa,
    "Australia": cifAu,
    "Giappone": cifJp,
    "Cina": cifCn,
    "USA": cifUs,
    "Monaco": cifMc,
    "Canada": cifCa,
    "Spagna": cifEs,
    "Austria": cifAt,
    "UK": cifGb,
    "Ungheria": cifHu,
    "Belgio": cifBe,
    "Olanda": cifNl,
    "Italia": cifIt,
    "Azerbaijan": cifAz,
    "Singapore": cifSg,
    "Messico": cifMx,
    "Brasile": cifBr,
    "Qatar": cifQa,
    "Emirati Arabi Uniti": cifAe,
  };
  

  constructor(public authService: AuthService, private dbData: DbDataService, public fantaService: FantaService){}

  ngOnInit(): void {
    
    this.username = sessionStorage.getItem('user') ?? "";
    this.userId = Number(sessionStorage.getItem('userId'));
    
    this.piloti  = this.dbData.getAllDrivers();

    this.tracks = this.dbData.getAllTracks();

    this.userFantaPoints = this.fantaService.getFantaPoints(this.userId);

        //test votazione pregeressa
    const updatedDate = "2024-12-05T23:00:00.000Z";
    // this.tracks = this.tracks.map(item => 
    //   item.track_id === "1" ? { ...item, date: updatedDate } : item
    // );
    // const previusVote: number[] = [1,2,3,4,5,6];
    // this.votazioni.set(1, previusVote);

    this.nextTracks = this.tracks
      .filter(item => new Date(item.date) >= new Date())
      .slice(0,4);
    this.previusTracks = this.tracks
      .filter(item => new Date(item.date) < new Date());

    this.previusTracks.forEach( track => {
      const previousVote: Fanta | undefined = this.fantaService.getFantaVote(this.userId, track.track_id);
      if ( previousVote )
      {
        const previousVoteArray = [
          previousVote.id_1_place ?? 0, 
          previousVote.id_2_place ?? 0,
          previousVote.id_3_place ?? 0,
          previousVote.id_4_place ?? 0,
          previousVote.id_5_place ?? 0,
          previousVote.id_6_place ?? 0
        ];
        this.votazioni.set(track.track_id, previousVoteArray);
      }
    })
  }


  onVoto(trackId: number) {
    if(this.formIsValid(trackId)){
      this.errorMessage = '';
      let fantaVoto: Fanta = {
        fanta_player_id: this.userId,
        username: this.username,
        id_1_place: this.getVoto(trackId,1),
        id_2_place: this.getVoto(trackId,2),
        id_3_place: this.getVoto(trackId,3),
        id_4_place: this.getVoto(trackId,4),
        id_5_place: this.getVoto(trackId,5),
        id_6_place: this.getVoto(trackId,6),
        track_id: trackId,
      };
   } else {
    this.errorMessage = 'piloti assenti o inseriti più volte';
   }
  }

  formIsValid(trackId: number): boolean {
    const votoArray = this.votazioni.get(trackId) || [];
    const hasDuplicates = votoArray.some((v, i) => votoArray.indexOf(v) !== i);
    if(hasDuplicates || votoArray.length < 6){
      return false;
    }
    return true;
  }

  getVoto(trackId: number, index: number): number {
    const votoArray = this.votazioni.get(trackId) || [];
    return votoArray[index-1] || 0;
  }

  getVoti(trackId: number): number[] | undefined{ 
    return this.votazioni.get(trackId);
  }
  
  setVoto(trackId: number, index: number, valore: number): void {
    if(valore){
      let votoArray = this.votazioni.get(trackId);
      if (!votoArray) {
        votoArray = [];
        this.votazioni.set(trackId, votoArray);
      }
      votoArray[index-1] = valore;
    }
  }

  getPilota(id: number): any | null{
    return this.piloti.find(driver => driver.driver_id === id.toString()) || null;
  }

  getPosizioneArrivo(pilota: number, trackId: number): number{
    const result: RaceResult | undefined = this.fantaService.getRaceResult(trackId);
    if (result)
    {
      if (result.id_1_place == pilota) return 1;
      if (result.id_2_place == pilota) return 2;
      if (result.id_3_place == pilota) return 3;
      if (result.id_4_place == pilota) return 4;
      if (result.id_5_place == pilota) return 5;
      if (result.id_6_place == pilota) return 6;
    }
    return 0;
  }

  getPunti(pilota: number, trackId: number): number{
    let posizioneArrivo: number = this.getPosizioneArrivo(pilota, trackId);
    let votazione: number = this.getVoto(trackId, posizioneArrivo);
    return votazione == pilota ? this.fantaService.getCorrectResponsePoint() : 0;  
  }

  getPuntiGp( trackId: number): number{
    let punti: number = 0;
    punti = punti + this.getPunti(1, trackId);
    punti = punti + this.getPunti(2, trackId);
    punti = punti + this.getPunti(3, trackId);
    punti = punti + this.getPunti(4, trackId);
    punti = punti + this.getPunti(5, trackId);
    punti = punti + this.getPunti(6, trackId);
    return punti;
  }

  getUserPoints(): number{
    return 100;
  }

  isCorrect(pilota: number, trackId: number): voteStatus {
    let posizioneArrivo: number = this.getPosizioneArrivo(pilota, trackId);
    let votazione: number = this.getVoto(trackId, posizioneArrivo);
    let status: voteStatus = {
      icon: cilXCircle,
      color: 'red'
    };
    if (votazione == pilota)
    {
      status.icon = cilCheckCircle;
      status.color = 'green';
    }
    else
    {
      status.icon = cilXCircle;
      status.color = 'red';
    }
    return status;
  }

}
