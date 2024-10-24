import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DocsExampleComponent } from '@docs-components/public-api';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';


interface GPResult {
  race: string[];
  sprint_1: string[];
  sprint_2: string[];
  qualify: string[];
  free_practice: string[];
}

interface AllGPs {
  name: string;
  date: string;
  data: GPResult;
}

@Component({
  selector: 'app-championship',
  standalone: true,
  imports: [CommonModule, IconDirective, RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective],
  templateUrl: './championship.component.html',
  styleUrl: './championship.component.scss'
})
export class ChampionshipComponent {
  public gp_results: GPResult =
  {
      race: ["redmamba", "fastman"],
      sprint_1: ["redmamba", "fastman"],
      sprint_2: ["fastman", "redmamba"],
      qualify: ["fastman", "redmamba"],
      free_practice: ["redmamba", "fastman"],
  };

  public all_gps: AllGPs[] = [
    {
      name: "monaco",
      date: "10/12/2022",
      data: {
        race: this.gp_results.race,
        sprint_1: this.gp_results.sprint_1,
        sprint_2: this.gp_results.sprint_2,
        qualify: this.gp_results.qualify,
        free_practice: this.gp_results.free_practice,
      }
    }
  ];

  constructor() { }

}