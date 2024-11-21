import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DocsExampleComponent } from '@docs-components/public-api';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, ContainerComponent } from '@coreui/angular';
import { cifMc, cifSg, cifIt, cifUs } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import {DbDataService} from 'src/app/service/db-data.service';  //aggiunto il servizio per dati db

@Component({
  selector: 'app-championship',
  standalone: true,
  imports: [ContainerComponent, IconDirective, CommonModule, IconDirective, RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective],
  templateUrl: './championship.component.html',
  styleUrl: './championship.component.scss'
})
export class ChampionshipComponent implements OnInit{

  public championship_data: any[] = [];
  
  constructor(private dbData: DbDataService) { }

  ngOnInit(): void {
    this.championship_data = this.dbData.getChampionship() ;
  }
}