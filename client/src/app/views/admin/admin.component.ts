import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { 
  AccordionComponent, 
  AccordionItemComponent,
  AccordionButtonDirective,
  ContainerComponent,
  RowComponent,
  ColComponent,
  TemplateIdDirective,
  TableDirective,
  BadgeComponent,
  GridModule,
  ButtonDirective
} from '@coreui/angular';
import { cifAe, cifAt, cifAu, cifAz, cifBe, cifBh, cifBr, cifCa, cifCn, cifEs, cifGb, cifHu, cifIt, 
  cifJp, cifMc, cifMx, cifNl, cifQa, cifSa, cifSg, cifUs, cilX, cilCheckAlt, cilSwapVertical, cilFire, cilPowerStandby } from '@coreui/icons';
  import { IconDirective } from '@coreui/icons-angular';

import { DbDataService } from 'src/app/service/db-data.service';
import { GpResult } from '../../model/championship'

@Component({
  selector: 'app-admin',
  imports: [
    AccordionComponent,
    AccordionItemComponent,
    RowComponent,
    ColComponent,
    ContainerComponent,
    CommonModule,
    IconDirective,
    AccordionButtonDirective,
    TemplateIdDirective,
    TableDirective,
    BadgeComponent,
    FormsModule,
    GridModule,
    ButtonDirective,
    MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})

export class AdminComponent {
  // VARIABLE DEFINITIONS
  tracks: any[] = [];
  formStatus: { [key: number]: number } = {};
  piloti: any[] = [];
  raceResults: Map<number, any[]> = new Map<number, any[]>(); // [track_id, array_of_results]
  sprintResults: Map<number, any[]> = new Map<number, any[]>();
  qualiResults: Map<number, any[]> = new Map<number, any[]>();
  fpResults: Map<number, any[]> = new Map<number, any[]>();


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

  posizioni = new Map<number, string>([
    [1, "Primo"],
    [2, "Secondo"],
    [3, "Terzo"],
    [4, "Quarto"],
    [5, "Quinto"],
    [6, "Sesto"],
    [7, "Giro Veloce"],
    [8, "DNF"]
  ]);

  medals = new Map<number, string>([
    [1, "medal_first.svg"],
    [2, "medal_second.svg"],
    [3, "medal_third.svg"]
  ]);

  public fireIcon: string[] = cilFire;
  public powerIcon: string[] = cilPowerStandby;

  toppings = new FormControl('');

  // CONSTRUCTOR
  constructor(private dbData: DbDataService){};

  // FUNCTION DEFINTIONS
  ngOnInit(): void {
    this.tracks = this.dbData.getAllTracks();
    this.piloti  = this.dbData.getAllDrivers();
  }


  publishResult(trackId: number, hasSprint: string, form: NgForm): void {
    // check data validity
    let hasSprintBool = hasSprint == "1";
    if ( this.formIsValid(trackId, hasSprintBool) ) {
      let raceDnfResultTmp: number[] = this.raceResults.get(trackId)![7];
      let sprintDnfResultTmp: number[] = [];
      if ( hasSprintBool ) {
        sprintDnfResultTmp = this.sprintResults.get(trackId)![7];
      }

      let gpResult: GpResult = {
        trackId: trackId,
        hasSprint: hasSprintBool,
        raceResult: Array.from(this.raceResults.get(trackId)!.values()).slice(0, 7).map(x => Number(x)),
        raceDnfResult: raceDnfResultTmp ?  raceDnfResultTmp.map(x => Number(x)) : [],
        sprintResult: hasSprintBool ? Array.from(this.sprintResults.get(trackId)!.values()).slice(0, 7).map(x => Number(x)) : [],
        sprintDnfResult: sprintDnfResultTmp ? sprintDnfResultTmp.map(x => Number(x)) : [],
        qualiResult: Array.from(this.qualiResults.get(trackId)!.values()).map(x => Number(x)),
        fpResult: Array.from(this.fpResults.get(trackId)!.values()).map(x => Number(x))
      }

      console.log(gpResult)
      this.formStatus[trackId] = 1;
      // this.dbData.setGpResult(trackId, gpResult)
      // PUBLISH
    }
    else {
      this.formStatus[trackId] = 2;
    }
  }

  formIsValid(trackId: number, hasSprint: boolean): boolean {
    let is_valid = true;
    is_valid = is_valid && this.formValidator(this.raceResults.get(trackId) || []);
    is_valid = is_valid && this.formValidator(this.qualiResults.get(trackId) || []);
    is_valid = is_valid && this.formValidator(this.fpResults.get(trackId) || []);
    if ( hasSprint ) {
      is_valid = is_valid && this.formValidator(this.sprintResults.get(trackId) || []);
    }
    return is_valid;
  }

  formValidator(resultArray: any[]): boolean {
    let is_valid = true;
    let positions = resultArray.slice(0, 6);
    let fast_lap = resultArray[6];
    let all_positions = positions;

    // check duplicates in positions
    is_valid = is_valid && !positions.some((v, i) => v != 0 && positions.indexOf(v) !== i); 
    
    // check fast lap
    is_valid = is_valid && fast_lap != 0;

    if ( resultArray.length == 8 ) {
      let dnf: Number[] = resultArray[7].map((x: any) => Number(x));
      all_positions = all_positions.concat(dnf);

      // check dnf players are not in positions
      is_valid = is_valid && !dnf.some(item => positions.includes(item));

      // check last #num dnf players postions are left empty
      is_valid = is_valid && !positions.slice(6 - dnf.length).some((v, i) => v != 0);
    }

    // check all players have been inserted
    is_valid = is_valid && this.hasAllPlayers(all_positions);

    return is_valid;
  }

  hasAllPlayers(positions: number[]): boolean {
    const set = new Set(positions); // remove duplicates
    for (let i = 1; i <= 6; i++) {
      if (!set.has(i)) return false; // missing a number
    }
    return true; // all good
  }

  getRaceResult(trackId: number, position: number): any {
    const resultArray = this.raceResults.get(trackId) || [];
    return resultArray[position - 1] || 0;
  }
  
  getSprintResult(trackId: number, position: number): any {
    const resultArray = this.sprintResults.get(trackId) || [];
    return resultArray[position - 1] || 0;
  }

  getQualiResult(trackId: number, position: number): any {
    const resultArray = this.qualiResults.get(trackId) || [];
    return resultArray[position - 1] || 0;
  }

  getFpResult(trackId: number, position: number): any {
    const resultArray = this.fpResults.get(trackId) || [];
    return resultArray[position - 1] || 0;
  }

  setRaceResult(trackId: number, position: number, valore: any): void {
    if(valore) {
      let resultArray = this.raceResults.get(trackId);
      if (!resultArray) {
        resultArray = [];
        this.raceResults.set(trackId, resultArray);
      }
      if ( position - 1 < 7) {
        resultArray[position-1] = +valore;
      } else {
        if ( !resultArray[position-1] )
        {
          resultArray[position-1] = []
        }
        resultArray[position-1] = valore;
      }
    }
  }
  
  setSprintResult(trackId: number, position: number, valore: any): void {
     if(valore) {
      let resultArray = this.sprintResults.get(trackId);
      if (!resultArray) {
        resultArray = [];
        this.sprintResults.set(trackId, resultArray);
      }
      if ( position - 1 < 7) {
        resultArray[position-1] = +valore;
      } else {
        if ( !resultArray[position-1] )
        {
          resultArray[position-1] = []
        }
        resultArray[position-1] = valore;
      }
    }
  }

  setQualiResult(trackId: number, position: number, valore: any): void {
    if(valore) {
      let resultArray = this.qualiResults.get(trackId);
      if (!resultArray) {
        resultArray = [];
        this.qualiResults.set(trackId, resultArray);
      }
      resultArray[position-1] = +valore;
    }
  }

  setFpResult(trackId: number, position: number, valore: any): void {
    if(valore) {
      let resultArray = this.fpResults.get(trackId);
      if (!resultArray) {
        resultArray = [];
        this.fpResults.set(trackId, resultArray);
      }
      resultArray[position-1] = +valore;
    }
  }

}
