import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DocsExampleComponent } from '@docs-components/public-api';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, ContainerComponent } from '@coreui/angular';
import { cifMc, cifSg, cifIt, cifUs } from '@coreui/icons';
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
  flag: string[];
  date: string;
  data: GPResult;
}

@Component({
  selector: 'app-championship',
  standalone: true,
  imports: [ContainerComponent, IconDirective, CommonModule, IconDirective, RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective],
  templateUrl: './championship.component.html',
  styleUrl: './championship.component.scss'
})
export class ChampionshipComponent {
  public gp_results: GPResult[] = [
    {
      race: ["redmamba", "fastman", "HeavyButt"],
      sprint_1: ["redmamba", "fastman", "HeavyButt"],
      sprint_2: ["HeavyButt", "redmamba", "HeavyButt"],
      qualify: ["fastman", "redmamba", "HeavyButt"],
      free_practice: ["redmamba", "fastman", "HeavyButt"],
    },
    {
      race: ["HeavyButt", "fastman", "HeavyButt"],
      sprint_1: ["redmamba", "fastman", "HeavyButt"],
      sprint_2: ["fastman", "redmamba", "HeavyButt"],
      qualify: ["fastman", "HeavyButt", "HeavyButt"],
      free_practice: ["redmamba", "fastman", "HeavyButt"],
    },
    {
      race: ["redmamba", "fastman", "HeavyButt"],
      sprint_1: ["HeavyButt", "fastman", "HeavyButt"],
      sprint_2: ["fastman", "redmamba", "HeavyButt"],
      qualify: ["HeavyButt", "redmamba", "HeavyButt"],
      free_practice: ["redmamba", "HeavyButt", "HeavyButt"],
    },
    {
      race: ["redmamba", "HeavyButt", "HeavyButt"],
      sprint_1: ["redmamba", "fastman", "HeavyButt"],
      sprint_2: ["HeavyButt", "redmamba", "HeavyButt"],
      qualify: ["fastman", "redmamba", "HeavyButt"],
      free_practice: ["redmamba", "HeavyButt", "HeavyButt"],
    }
  ];


  public all_gps: AllGPs[] = [
    {
      name: "Monaco",
      flag: cifMc,
      date: "10/12/2022",
      data: {
        race: this.gp_results[0].race,
        sprint_1: this.gp_results[0].sprint_1,
        sprint_2: this.gp_results[0].sprint_2,
        qualify: this.gp_results[0].qualify,
        free_practice: this.gp_results[0].free_practice,
      }
    },
    {
      name: "Singapore",
      flag: cifSg,
      date: "10/12/2022",
      data: {
        race: this.gp_results[1].race,
        sprint_1: this.gp_results[1].sprint_1,
        sprint_2: this.gp_results[1].sprint_2,
        qualify: this.gp_results[1].qualify,
        free_practice: this.gp_results[1].free_practice,
      }
    },
    {
      name: "Monza",
      flag: cifIt,
      date: "10/12/2022",
      data: {
        race: this.gp_results[2].race,
        sprint_1: this.gp_results[2].sprint_1,
        sprint_2: this.gp_results[2].sprint_2,
        qualify: this.gp_results[2].qualify,
        free_practice: this.gp_results[2].free_practice,
      }
    },
    {
      name: "Texas",
      flag: cifUs,
      date: "10/12/2022",
      data: {
        race: this.gp_results[3].race,
        sprint_1: this.gp_results[3].sprint_1,
        sprint_2: this.gp_results[3].sprint_2,
        qualify: this.gp_results[3].qualify,
        free_practice: this.gp_results[3].free_practice,
      }
    }
  ];

  constructor() { }
}