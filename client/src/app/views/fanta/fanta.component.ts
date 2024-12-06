import { DatePipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';    
import { FormsModule } from '@angular/forms';
import { AccordionComponent, 
    AccordionItemComponent, 
    FormModule, 
    SharedModule,
    ButtonDirective, 
    DropdownComponent,  
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
import { map } from 'rxjs';

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

  username: any = '';
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

  constructor(public authService: AuthService, private router: Router, private dbData: DbDataService){}

  ngOnInit(): void {
      this.username = sessionStorage.getItem('user');
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
      console.log(this.piloti);
      console.log(this.posizioni);
      console.log(this.tracks);
      console.log(this.votazioni);
      console.log(this.votazioni.get(1));
  }

  logout(){
    this.authService.logout()
    this.router.navigate(['/']);
  }

  onVoto(trackName: number) {
    console.log("votazione di: " + this.username + " per pista " + trackName);
    console.log(this.votazioni.get(trackName));
  }

  getVoto(trackId: number, index: number): number {
    const votoArray = this.votazioni.get(trackId) || [];
    return votoArray[index] || 0;
  }

  getVoti(trackId: number): number[] | undefined{ 
    return this.votazioni.get(trackId);
  }
  
  setVoto(trackId: number, index: number, valore: number): void {
    let votoArray = this.votazioni.get(trackId);
    if (!votoArray) {
      votoArray = [];
      this.votazioni.set(trackId, votoArray);
    }
    votoArray[index] = valore;
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