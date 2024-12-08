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
import { cifAe, cifAt, cifAu, cifAz, cifBe, cifBh, cifBr, cifCa, cifCn, cifEs, cifGb, cifHu, cifIt, 
    cifJp, cifMc, cifMx, cifNl, cifQa, cifSa, cifSg, cifUs, cilX, cilCheck } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { Fanta } from '../../model/fanta';


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
  username: string | null = '';
  userId!: number;
  piloti: any[] = [];
  tracks: any[] = [];
  nextTracks: any[] = [];
  previusTracks: any[] = [];
  //voto: number[] = [];
  votazioni: Map<number, number[]> = new Map<number, number[]>();

  public fantaData: any[] = [];
  public fantaPoints: any[] = [];
  
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

  constructor(public authService: AuthService, private dbData: DbDataService){}

  ngOnInit(): void {

    this.fantaData = this.dbData.getAllFanta();

    for (let fanta_entry of this.fantaData) {
      this.fantaPoints[fanta_entry["username"]] += this.calculateFantaPoints(fanta_entry);
    }
    console.log(this.fantaPoints);

    this.username = sessionStorage.getItem('user');
    this.userId = Number(sessionStorage.getItem('userId'));
    this.piloti  = this.dbData.getAllDrivers();

    this.tracks = this.dbData.getAllTracks();
    
    //test votazione pregeressa
    const updatedDate = "2024-12-05T23:00:00.000Z";
    this.tracks = this.tracks.map(item => 
      item.track_id === "1" ? { ...item, date: updatedDate } : item
    );
    const previusVote: number[] = [1,2,3,4,5,6];
    this.votazioni.set(1, previusVote);

    this.nextTracks = this.tracks
      .filter(item => new Date(item.date) >= new Date())
      .slice(0,4);
    this.previusTracks = this.tracks
      .filter(item => new Date(item.date) < new Date());
  }

  calculateFantaPoints(entry: any): number {
    var results_array = [entry["driver_race_1_place"], entry["driver_race_2_place"], entry["driver_race_3_place"], entry["driver_race_4_place"], entry["driver_race_5_place"], entry["driver_race_6_place"], entry["driver_race_fast_lap"]];
    var picks_array = [entry["1_place_pick"], entry["2_place_pick"], entry["3_place_pick"], entry["4_place_pick"], entry["5_place_pick"], entry["6_place_pick"], entry["fast_lap_pick"]];

    var and_array = results_array.map((item, index) => (item === picks_array[index] ? 1 : 0));
    return 0;
  }

  onVoto(trackId: number) {
    if(this.formIsValid(trackId)){
      this.errorMessage = '';
      let fantaVoto: Fanta = {
        fantaPlayerId: this.userId,
        place1Id: this.getVoto(trackId,1),
        place2Id: this.getVoto(trackId,2),
        place3Id: this.getVoto(trackId,3),
        place4Id: this.getVoto(trackId,4),
        place5Id: this.getVoto(trackId,5),
        place6Id: this.getVoto(trackId,6),
        raceId: trackId,
      };
      console.log(fantaVoto);
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
    return 1;
  }

  getPunti(pilota: number, trackId: number): number{
    return pilota-1;
  }

  getPuntiGp( trackId: number): number{
    return 1;
  }

  getUserPoints(): number{
    return 100;
  }

  isCorrect(pilota: number, trackId: number): string[] {
      return this.getPunti(pilota,trackId) >0 ? cilCheck : cilX;
    }

}
