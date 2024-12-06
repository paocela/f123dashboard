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
    AccordionButtonDirective} from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import { GridModule } from '@coreui/angular';
import { } from '@coreui/angular';
import { DbDataService } from 'src/app/service/db-data.service';
import { cifAe, cifAt, cifAu, cifAz, cifBe, cifBh, cifBr, cifCa, cifCn, cifEs, cifGb, cifHu, cifIt, cifJp, cifMc, cifMx, cifNl, cifQa, cifSa, cifSg, cifUs } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

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
    DropdownComponent,
    SharedModule,
    AccordionComponent,
    AccordionItemComponent,
    TemplateIdDirective,
    AccordionButtonDirective,
    IconDirective,
    DatePipe 
],
  templateUrl: './fanta.component.html',
  styleUrl: './fanta.component.scss'
})
export class FantaComponent {
  username: any = '';
  piloti: any[] = [];
  tracks: any[] = [];
  nextTracks: any[] = [];
  voto: number[] = [];
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
      this.piloti = this.dbData.getAllDrivers();

      this.tracks = this.dbData.getAllTracks();

      this.nextTracks = this.tracks
                        .filter(item => new Date(item.date) >= new Date())
                        .slice(0,4);
      console.log(this.piloti);
      console.log(this.posizioni);
      console.log(this.tracks);
  }

  logout(){
    this.authService.logout()
    this.router.navigate(['/']);
  }

  onVoto(trackName: number) {
    console.log("votazione di: " + this.username + " per pista " + trackName);
    console.log(this.voto);
  }

}