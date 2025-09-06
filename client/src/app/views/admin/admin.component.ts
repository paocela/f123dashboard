import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
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
  ButtonDirective,
  SpinnerComponent
} from '@coreui/angular';
import { cifAe, cifAt, cifAu, cifAz, cifBe, cifBh, cifBr, cifCa, cifCn, cifEs, cifGb, cifHu, cifIt, 
  cifJp, cifMc, cifMx, cifNl, cifQa, cifSa, cifSg, cifUs, cilX, cilCheckAlt, cilSwapVertical, cilFire, cilPowerStandby } from '@coreui/icons';
  import { IconDirective } from '@coreui/icons-angular';

import { DbDataService } from 'src/app/service/db-data.service';
import { AuthService } from 'src/app/service/auth.service';
import { GpResult } from '../../model/championship';
import { ChampionshipData } from '../../model/championship-data';
import { DriverData } from '../../model/driver';
import { TrackData } from '../../model/track';
import { Season } from '../../model/season';

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
    ReactiveFormsModule,
    GridModule,
    ButtonDirective,
    SpinnerComponent,
    MatFormFieldModule, 
    MatSelectModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})

export class AdminComponent implements OnInit {
  
  // VARIABLE DEFINITIONS
  tracks: TrackData[] = [];
  piloti: DriverData[] = [];
  championshipData: ChampionshipData[] = [];
  seasons: Season[] = [];
  selectedSeason: number | null = null;
  formStatus: { [key: number]: number } = {};
  raceResults: Map<number, any[]> = new Map<number, any[]>(); // [track_id, array_of_results]
  sprintResults: Map<number, any[]> = new Map<number, any[]>();
  qualiResults: Map<number, any[]> = new Map<number, any[]>();
  fpResults: Map<number, any[]> = new Map<number, any[]>();

  // Loading states
  isInitialLoading: boolean = true;
  isSeasonLoading: boolean = false;
  isSubmitting: { [key: number]: boolean } = {};

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
    [7, "Settimo"],
    [8, "Ottavo"],
    [9, "Giro Veloce"],
    [10, "DNF"]
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
  constructor(
    private dbData: DbDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  // FUNCTION DEFINTIONS
  async ngOnInit(): Promise<void> {
    this.isInitialLoading = true;
    
    try {
      // Additional security check
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        this.router.navigate(['/dashboard']);
        return;
      }

      // Load seasons first
      this.seasons = await this.dbData.getAllSeasons();
      
      // Get the latest season (first in the list since it's ordered by start_date DESC)
      if (this.seasons.length > 0) {
        console.log(this.seasons);
        this.selectedSeason = this.seasons[0].id;
      }

      // Load data for the selected season
      await this.loadSeasonData();
    } finally {
      this.isInitialLoading = false;
    }
  }

  async loadSeasonData(): Promise<void> {
    this.isSeasonLoading = true;
    try {
      if (this.selectedSeason) {
        // Load data for specific season
        console.log(this.selectedSeason, typeof this.selectedSeason);

        this.tracks = await this.dbData.getAllTracksBySeason(this.selectedSeason);
        this.championshipData = await this.dbData.getChampionshipBySeason(this.selectedSeason);
      } else {
        // Load data for latest season (default)
        this.tracks = await this.dbData.getAllTracksBySeason();
        this.championshipData = await this.dbData.getChampionshipBySeason();
      }
      
      // Load drivers (not season-specific)
      this.piloti = this.dbData.getAllDrivers();

      this.initializeResults();
    } finally {
      this.isSeasonLoading = false;
    }
  }

  async onSeasonChange(): Promise<void> {
    await this.loadSeasonData();
  }

  initializeResults() {
    let pilotiMap: Map<string, number> = new Map<string, number>(); // map to quickly search driver_id given its driver_username
    for (let pilota of this.piloti) {
      pilotiMap.set(pilota.driver_username, pilota.driver_id);
    }

    for (let gp of this.championshipData) {
      const track = this.tracks.find(t => t.name == gp.track_name);
      if (!track) continue; // Skip if track not found
      
      let track_id = track.track_id;
      
      // Initialize race results
      let race: any[] = [];
      const activeRaceSession = gp.gran_prix_has_x2 === '1' ? gp.sessions.full_race : gp.sessions.race;
      const activeFastLapDriver = gp.gran_prix_has_x2 === '1' ? gp.fastLapDrivers.full_race : gp.fastLapDrivers.race;
      
      if (activeRaceSession && activeRaceSession.length > 0) {
        // Fill positions 1-8
        for (let i = 1; i <= 8; i++) {
          const driver = activeRaceSession.find(r => r.position === i);
          race[i-1] = driver ? pilotiMap.get(driver.driver_username) || 0 : 0;
        }

        // Fast lap driver (position 9 in array, index 8)
        race[8] = activeFastLapDriver ? pilotiMap.get(activeFastLapDriver) || 0 : 0;

        // DNF drivers (position 10 in array, index 9)
        const dnfDrivers = activeRaceSession.filter(r => r.position === 0);
        race[9] = dnfDrivers.map(d => pilotiMap.get(d.driver_username)).filter(id => id !== undefined);
      } else {
        // Initialize empty array if no results
        race = [0, 0, 0, 0, 0, 0, 0, 0, []];
      }

      // Initialize sprint results
      let sprint: any[] = [];
      if (gp.gran_prix_has_sprint === '1' && gp.sessions.sprint) {
        // Fill positions 1-8
        for (let i = 1; i <= 8; i++) {
          const driver = gp.sessions.sprint.find(r => r.position === i);
          sprint[i-1] = driver ? pilotiMap.get(driver.driver_username) || 0 : 0;
        }

        // Fast lap driver (position 9 in array, index 8)
        sprint[8] = gp.fastLapDrivers.sprint ? pilotiMap.get(gp.fastLapDrivers.sprint) || 0 : 0;

        // DNF drivers (position 10 in array, index 9)
        const dnfDrivers = gp.sessions.sprint.filter(r => r.position === 0);
        sprint[9] = dnfDrivers.map(d => pilotiMap.get(d.driver_username)).filter(id => id !== undefined);
      }

      // Initialize qualifying results
      let quali: any[] = [];
      if (gp.sessions.qualifying) {
        for (let i = 1; i <= 8; i++) {
          const driver = gp.sessions.qualifying.find(r => r.position === i);
          quali[i-1] = driver ? pilotiMap.get(driver.driver_username) || 0 : 0;
        }
      } else {
        quali = [0, 0, 0, 0, 0, 0, 0, 0];
      }

      // Initialize free practice results
      let fp: any[] = [];
      if (gp.sessions.free_practice) {
        for (let i = 1; i <= 8; i++) {
          const driver = gp.sessions.free_practice.find(r => r.position === i);
          fp[i-1] = driver ? pilotiMap.get(driver.driver_username) || 0 : 0;
        }
      } else {
        fp = [0, 0, 0, 0, 0, 0, 0, 0];
      }

      this.raceResults.set(track_id, race);
      this.sprintResults.set(track_id, sprint);
      this.qualiResults.set(track_id, quali);
      this.fpResults.set(track_id, fp);
    }
  }


  async publishResult(trackId: number, hasSprint: string, form: NgForm): Promise<void> {
    this.isSubmitting[trackId] = true;
    
    try {
      // check data validity
      let hasSprintBool = hasSprint === "1";
      if ( this.formIsValid(trackId, hasSprintBool) ) {
        let raceDnfResultTmp: number[] = this.raceResults.get(trackId)![9];
        let sprintDnfResultTmp: number[] = [];
        if ( hasSprintBool ) {
          sprintDnfResultTmp = this.sprintResults.get(trackId)![9];
        }

        let gpResult: GpResult = {
          trackId: trackId,
          hasSprint: hasSprintBool,
          raceResult: Array.from(this.raceResults.get(trackId)!.values()).slice(0, 9).map(x => Number(x)),
          raceDnfResult: raceDnfResultTmp ?  raceDnfResultTmp.map(x => Number(x)) : [],
          sprintResult: hasSprintBool ? Array.from(this.sprintResults.get(trackId)!.values()).slice(0, 9).map(x => Number(x)) : [],
          sprintDnfResult: sprintDnfResultTmp ? sprintDnfResultTmp.map(x => Number(x)) : [],
          qualiResult: Array.from(this.qualiResults.get(trackId)!.values()).map(x => Number(x)),
          fpResult: Array.from(this.fpResults.get(trackId)!.values()).map(x => Number(x))
        }

        await this.dbData.setGpResult(trackId, gpResult);
        this.formStatus[trackId] = 1;
      }
      else {
        this.formStatus[trackId] = 2;
      }
    } finally {
      this.isSubmitting[trackId] = false;
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
    let positions = resultArray.slice(0, 8);
    let fast_lap = resultArray[8];
    let all_positions = positions;

    // check duplicates in positions
    is_valid = is_valid && !positions.some((v, i) => v != 0 && positions.indexOf(v) !== i); 
    
    // check fast lap
    is_valid = is_valid && fast_lap != 0;

    if ( resultArray.length == 10 ) {
      let dnf: Number[] = resultArray[9].map((x: any) => Number(x));
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
    for (let i = 1; i <= 8; i++) {
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
      if ( position - 1 < 9) {
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
      if ( position - 1 < 9) {
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
