import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DocsExampleComponent } from '@docs-components/public-api';
import { BadgeComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, ContainerComponent } from '@coreui/angular';
import { cifBh, cifAt, cifMc, cifJp, cifHu, cifCn, cifCa, cifEs, cifGb, cifBe, cifNl, cifAz, cifSg, cifIt, cifUs, cifAu, cifMx, cifBr, cifQa, cifAe, cifSa } from '@coreui/icons';
import { cilFire } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import {DbDataService} from 'src/app/service/db-data.service';  //aggiunto il servizio per dati db

@Component({
    selector: 'app-championship',
    imports: [BadgeComponent, ContainerComponent, IconDirective, CommonModule, IconDirective, RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective],
    templateUrl: './championship.component.html',
    styleUrl: './championship.component.scss'
})
export class ChampionshipComponent implements OnInit{

  public championship_data: any[] = [];
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

  public fireIcon: string[] = cilFire; 
  
  constructor(private dbData: DbDataService) { }

  ngOnInit(): void {
    this.championship_data = this.dbData.getChampionship() ;

    // for (let track of this.championship_data){
    //   const db_date: Date = new Date(track.date);
    //   console.log(this.championship_data[track.track_name]);
    //   //this.championship_data[track.track_name]["track_date"] = db_date.toLocaleDateString("it-CH");
    // }

  }
}