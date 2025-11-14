import { Component, OnInit, inject } from '@angular/core';
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
import { cilFire, cilPowerStandby } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { DbDataService } from 'src/app/service/db-data.service';
import { AuthService } from 'src/app/service/auth.service';
import { GpResult } from '../../model/championship';
import { medals, allFlags, posizioni } from '../../model/constants';
import type { ChampionshipData, Driver, Season, TrackData } from '@f123dashboard/shared';

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
  private dbData = inject(DbDataService);
  private authService = inject(AuthService);
  private router = inject(Router);

  
  // VARIABLE DEFINITIONS
  tracks: TrackData[] = [];
  piloti: Driver[] = [];
  championshipData: ChampionshipData[] = [];
  seasons: Season[] = [];
  selectedSeason: number | null = null;
  formStatus: Record<number, number> = {}; // 0: none, 1: success, 2: validation error, 3: backend error
  formErrors: Record<number, string[]> = {};
  raceResults: Map<number, any[]> = new Map<number, any[]>(); // [track_id, array_of_results]
  sprintResults: Map<number, any[]> = new Map<number, any[]>();
  qualiResults: Map<number, any[]> = new Map<number, any[]>();
  fpResults: Map<number, any[]> = new Map<number, any[]>();

  // Loading states
  isInitialLoading = true;
  isSeasonLoading = false;
  isSubmitting: Record<number, boolean> = {};

  public allFlags = allFlags;
  public medals = medals;
  public posizioni = new Map([...posizioni].filter(([key]) => key !== 11));
  public fireIcon: string[] = cilFire;
  public powerIcon: string[] = cilPowerStandby;

  toppings = new FormControl('');

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

        this.piloti = await this.dbData.getDriversData(this.selectedSeason);
        this.tracks = await this.dbData.getAllTracksBySeason(this.selectedSeason);
        this.championshipData = await this.dbData.getChampionshipBySeason(this.selectedSeason);
      } else {
        // Load data for latest season (default)
        this.piloti = await this.dbData.getDriversData();
        this.tracks = await this.dbData.getAllTracksBySeason();
        this.championshipData = await this.dbData.getChampionshipBySeason();
      }
      
      this.initializeResults();
    } finally {
      this.isSeasonLoading = false;
    }
  }

  async onSeasonChange(): Promise<void> {
    await this.loadSeasonData();
  }

  initializeResults() {
    const pilotiMap: Map<string, number> = new Map<string, number>(); // map to quickly search driver_id given its driver_username
    for (const pilota of this.piloti) 
      {pilotiMap.set(pilota.username, pilota.id);}
    

    for (const gp of this.championshipData) {
      const track = this.tracks.find(t => t.name == gp.track_name);
      if (!track) {continue;} // Skip if track not found
      
      const track_id = track.track_id;
      
      // Initialize race results
      let race: any[] = [];
      const activeRaceSession = gp.gran_prix_has_x2 === 1 ? gp.sessions.full_race : gp.sessions.race;
      const activeFastLapDriver = gp.gran_prix_has_x2 === 1 ? gp.fastLapDrivers.full_race : gp.fastLapDrivers.race;

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
      } else 
        // Initialize empty array if no results
        {race = [0, 0, 0, 0, 0, 0, 0, 0, []];}
      

      // Initialize sprint results
      const sprint: any[] = [];
      if (gp.gran_prix_has_sprint === 1 && gp.sessions.sprint) {
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
      if (gp.sessions.qualifying) 
        {for (let i = 1; i <= 8; i++) {
          const driver = gp.sessions.qualifying.find(r => r.position === i);
          quali[i-1] = driver ? pilotiMap.get(driver.driver_username) || 0 : 0;
        }}
       else 
        {quali = [0, 0, 0, 0, 0, 0, 0, 0];}
      

      // Initialize free practice results
      let fp: any[] = [];
      if (gp.sessions.free_practice) 
        {for (let i = 1; i <= 8; i++) {
          const driver = gp.sessions.free_practice.find(r => r.position === i);
          fp[i-1] = driver ? pilotiMap.get(driver.driver_username) || 0 : 0;
        }}
       else 
        {fp = [0, 0, 0, 0, 0, 0, 0, 0];}
      

      this.raceResults.set(track_id, race);
      this.sprintResults.set(track_id, sprint);
      this.qualiResults.set(track_id, quali);
      this.fpResults.set(track_id, fp);
    }
  }


  async publishResult(trackId: number, hasSprint: string, form: NgForm): Promise<void> {
    if (!this.selectedSeason) 
      {throw new Error('Nessuna stagione selezionata');}
    
    console.log('Publishing results for trackId:', trackId, 'seasonId:', this.selectedSeason);
    this.isSubmitting[trackId] = true;
    
    // Clear previous errors and status
    this.formErrors[trackId] = [];
    this.formStatus[trackId] = 0; // Reset status
    
    try {
      // check data validity
      const hasSprintBool = hasSprint === "1";
      if ( this.formIsValid(trackId, hasSprintBool) ) {
        const raceDnfResultTmp: number[] = this.raceResults.get(trackId)![9];
        let sprintDnfResultTmp: number[] = [];
        if ( hasSprintBool ) 
          {sprintDnfResultTmp = this.sprintResults.get(trackId)![9];}
        

        const gpResult: GpResult = {
          trackId: trackId,
          hasSprint: hasSprintBool,
          raceResult: Array.from(this.raceResults.get(trackId)!.values()).slice(0, 9).map(x => Number(x)),
          raceDnfResult: raceDnfResultTmp ?  raceDnfResultTmp.map(x => Number(x)) : [],
          sprintResult: hasSprintBool ? Array.from(this.sprintResults.get(trackId)!.values()).slice(0, 9).map(x => Number(x)) : [],
          sprintDnfResult: sprintDnfResultTmp ? sprintDnfResultTmp.map(x => Number(x)) : [],
          qualiResult: Array.from(this.qualiResults.get(trackId)!.values()).map(x => Number(x)),
          fpResult: Array.from(this.fpResults.get(trackId)!.values()).map(x => Number(x)),
          seasonId: +this.selectedSeason
        }

        try {
          const result = await this.dbData.setGpResult(trackId, gpResult);
          
          // Check if the result indicates success
          if (result && typeof result === 'string') {
            const parsedResult = JSON.parse(result);
            if (parsedResult.success) {
              this.formStatus[trackId] = 1; // Success
              this.formErrors[trackId] = []; // Clear any previous errors
              console.log('Risultati salvati con successo:', parsedResult.message);
            } else {
              this.formStatus[trackId] = 3; // Backend error
              this.formErrors[trackId] = [`Errore del server: ${parsedResult.message || 'Errore sconosciuto'}`];
              console.error('Errore dal backend:', parsedResult.message);
            }
          } else {
            // Assume success if no specific response format
            this.formStatus[trackId] = 1; // Success
            this.formErrors[trackId] = []; // Clear any previous errors
            console.log('Risultati salvati con successo');
          }
        } catch (backendError) {
          this.formStatus[trackId] = 3; // Backend error
          this.formErrors[trackId] = [`Errore di comunicazione con il server: ${backendError instanceof Error ? backendError.message : 'Errore sconosciuto'}`];
          console.error('Errore nella chiamata al backend:', backendError);
        }
      }
      else 
        {this.formStatus[trackId] = 2;} // Validation errors
      
    } catch (error) {
      this.formStatus[trackId] = 3; // General error
      this.formErrors[trackId] = [`Errore generale: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`];
      console.error('Errore generale in publishResult:', error);
    } finally {
      this.isSubmitting[trackId] = false;
    }
  }

  formIsValid(trackId: number, hasSprint: boolean): boolean {
    let is_valid = true;
    const errorMessages: string[] = [];

    // Validate race results (with DNF support)
    const raceValid = this.validateSessionWithDnf(this.raceResults.get(trackId) || [], 'Gara');
    is_valid = is_valid && raceValid.isValid;
    if (!raceValid.isValid) 
      {raceValid.errors.forEach(error => errorMessages.push(`Gara: ${error}`));}
    

    // Validate qualifying results (no DNF)
    const qualiValid = this.validateSessionNoDnf(this.qualiResults.get(trackId) || [], 'Qualifica');
    is_valid = is_valid && qualiValid.isValid;
    if (!qualiValid.isValid) 
      {qualiValid.errors.forEach(error => errorMessages.push(`Qualifica: ${error}`));}
    

    // Validate free practice results (no DNF)
    const fpValid = this.validateSessionNoDnf(this.fpResults.get(trackId) || [], 'Prove Libere');
    is_valid = is_valid && fpValid.isValid;
    if (!fpValid.isValid) 
      {fpValid.errors.forEach(error => errorMessages.push(`Prove Libere: ${error}`));}
    

    // Validate sprint results if applicable (with DNF support)
    if (hasSprint) {
      const sprintValid = this.validateSessionWithDnf(this.sprintResults.get(trackId) || [], 'Sprint');
      is_valid = is_valid && sprintValid.isValid;
      if (!sprintValid.isValid) 
        {sprintValid.errors.forEach(error => errorMessages.push(`Sprint: ${error}`));}
      
    }

    // Store error messages for this track
    this.formErrors[trackId] = errorMessages;

    // Log errors for debugging
    if (!is_valid) 
      {console.error('Errori di validazione form:', errorMessages);}
    

    return is_valid;
  }

  hasAllPlayersExactlyOnce(positions: number[]): boolean {
    return this.getDriverValidationErrors(positions).length === 0;
  }

  getDriverValidationErrors(positions: number[]): string[] {
    const errors: string[] = [];
    const driverCount = this.piloti.length;
    const validPositions = positions.filter(p => Number(p) > 0).map(p => Number(p));
    const uniqueDrivers = new Set(validPositions);
    
    // Get actual driver IDs from piloti array
    const validDriverIds = new Set(this.piloti.map(p => +p.id));
    console.log('Valid driver IDs:', Array.from(validDriverIds));
    console.log('typeof validDriverIds:', typeof Array.from(validDriverIds)[0]);
    
    // Check for duplicate drivers
    if (validPositions.length !== uniqueDrivers.size) 
      {errors.push(`Alcuni piloti sono assegnati più volte`);}
    
    
    // Check for missing or extra drivers
    if (uniqueDrivers.size < driverCount) {
      const missingCount = driverCount - uniqueDrivers.size;
      errors.push(`${missingCount} pilota/i mancante/i dai risultati`);
    } else if (uniqueDrivers.size > driverCount) 
      {errors.push(`Troppi piloti assegnati`);}
    
    
    // Check if all provided driver IDs are valid (exist in piloti array)
    for (const driverId of uniqueDrivers) {
      console.log('typeof driverId:', typeof driverId);
      console.log('driverId:', driverId);
      if (!validDriverIds.has(driverId)) {
        // Find the driver username if it exists, otherwise show the ID
        const driver = this.piloti.find(p => p.id == driverId);
        const driverName = driver ? driver.username : `ID ${driverId}`;
        errors.push(`Pilota ${driverName} non esiste`);
        break; // Only show first invalid driver ID to avoid spam
      }
    }
    
    return errors;
  }

  validateSessionWithDnf(resultArray: any[], sessionName: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!resultArray || resultArray.length < 9) {
      errors.push(`Dati ${sessionName} incompleti`);
      return { isValid: false, errors };
    }

    const positions = resultArray.slice(0, 8);
    const fastLap = resultArray[8];
    const dnf: number[] = resultArray.length > 9 && resultArray[9] ? resultArray[9].map((x: any) => Number(x)) : [];
    
    // Check for duplicates in positions (excluding zeros)
    const nonZeroPositions = positions.filter(p => p !== 0);
    const positionSet = new Set(nonZeroPositions);
    if (nonZeroPositions.length !== positionSet.size) 
      {errors.push(`Piloti duplicati trovati nelle posizioni`);}
    

    // Check fast lap is set
    if (!fastLap || fastLap === 0) 
      {errors.push(`Il pilota del giro veloce deve essere selezionato`);}
    

    // Check DNF drivers are not in positions
    if (dnf.some(d => positions.includes(d))) 
      {errors.push(`I piloti DNF non possono essere anche nelle posizioni di gara`);}
    

    // Check that positions after DNF count are empty
    const emptyPositionsNeeded = dnf.length;
    const lastPositions = positions.slice(8 - emptyPositionsNeeded);
    if (lastPositions.some(p => p !== 0)) 
      {errors.push(`Le ultime ${emptyPositionsNeeded} posizioni devono essere vuote quando ${dnf.length} piloti sono DNF`);}
    

    // Check all drivers are present exactly once
    const allDrivers = nonZeroPositions.concat(dnf);
    if (!this.hasAllPlayersExactlyOnce(allDrivers)) {
      const validationErrors = this.getDriverValidationErrors(allDrivers);
      errors.push(...validationErrors);
    }

    return { isValid: errors.length === 0, errors };
  }

  validateSessionNoDnf(resultArray: any[], sessionName: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!resultArray || resultArray.length < 8) {
      errors.push(`Dati ${sessionName} incompleti`);
      return { isValid: false, errors };
    }

    const positions = resultArray.slice(0, 8);
    
    // Check for duplicates in positions (excluding zeros)
    const nonZeroPositions = positions.filter(p => p !== 0);
    const positionSet = new Set(nonZeroPositions);
    if (nonZeroPositions.length !== positionSet.size) 
      {errors.push(`Piloti duplicati trovati nelle posizioni`);}
    

    // Check all positions are filled
    if (positions.some(p => p === 0 || p === null || p === undefined)) 
      {errors.push(`Tutte le posizioni devono essere compilate`);}
    

    // Check all drivers are present exactly once
    if (!this.hasAllPlayersExactlyOnce(positions)) {
      const validationErrors = this.getDriverValidationErrors(positions);
      errors.push(...validationErrors);
    }

    return { isValid: errors.length === 0, errors };
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
      if ( position - 1 < 9) 
        {resultArray[position-1] = +valore;}
       else {
        if ( !resultArray[position-1] )
        
          {resultArray[position-1] = []}
        
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
      if ( position - 1 < 9) 
        {resultArray[position-1] = +valore;}
       else {
        if ( !resultArray[position-1] )
        
          {resultArray[position-1] = []}
        
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
