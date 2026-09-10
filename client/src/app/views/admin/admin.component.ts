import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed, WritableSignal } from '@angular/core';
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
  ButtonDirective
} from '@coreui/angular';
import { cilFire, cilPowerStandby } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { DbDataService } from 'src/app/service/db-data.service';
import { AuthService } from 'src/app/service/auth.service';
import { GpResult } from '../../model/championship';
import { medals, allFlags } from '../../model/constants';
import type { ChampionshipData, Driver, Season, SessionResult, TrackData } from '@f123dashboard/shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  tracks = signal<TrackData[]>([]);
  piloti = signal<Driver[]>([]);
  championshipData = signal<ChampionshipData[]>([]);
  seasons = signal<Season[]>([]);
  selectedSeason = signal<number | null>(null);
  formStatus = signal<Record<number, number>>({}); // 0: none, 1: success, 2: validation error, 3: backend error
  formErrors = signal<Record<number, string[]>>({});
  raceResults = signal<Map<number, any[]>>(new Map<number, any[]>()); // [track_id, array_of_results]
  sprintResults = signal<Map<number, any[]>>(new Map<number, any[]>());
  qualiResults = signal<Map<number, any[]>>(new Map<number, any[]>());
  fpResults = signal<Map<number, any[]>>(new Map<number, any[]>());

  // Loading states
  isInitialLoading = signal(true);
  isSeasonLoading = signal(false);
  isSubmitting = signal<Record<number, boolean>>({});

  public allFlags = allFlags;
  public medals = medals;
  public driverCount = computed(() => this.piloti().length);
  public posizioni = computed(() => {
    const n = this.driverCount();
    const map = new Map<number, string>();
    for (let i = 1; i <= n; i++) {
      map.set(i, String(i));
    }
    map.set(n + 1, 'Giro Veloce');
    map.set(n + 2, 'DNF');
    return map;
  });
  public fireIcon: string[] = cilFire;
  public powerIcon: string[] = cilPowerStandby;

  toppings = new FormControl('');

  // FUNCTION DEFINTIONS
  async ngOnInit(): Promise<void> {
    this.isInitialLoading.set(true);
    try {
      // Additional security check
      const currentUser = this.authService.currentUser();
      if (!currentUser?.isAdmin) {
        this.router.navigate(['/dashboard']);
        return;
      }

      // Load seasons first
      const seasons = await this.dbData.getAllSeasons();
      this.seasons.set(seasons);
      
      // Get the latest season (first in the list since it's ordered by start_date DESC)
      if (seasons.length > 0) {
        this.selectedSeason.set(seasons[0].id);
      }

      // Load data for the selected season
      await this.loadSeasonData();
    } catch (error) {
      console.error('Errore durante il caricamento dei dati della stagione:', error);
      this.isInitialLoading.set(false);
    } finally {
      this.isInitialLoading.set(false);
    }
  }

  async loadSeasonData(): Promise<void> {
    this.isSeasonLoading.set(true);
    try {
      const seasonId = this.selectedSeason();
      let piloti: Driver[];
      let tracks: TrackData[];
      let championshipData: ChampionshipData[];
      
      if (seasonId) {
        // Load data for specific season concurrently
        [piloti, tracks, championshipData] = await Promise.all([
          this.dbData.getDriversData(seasonId),
          this.dbData.getAllTracksBySeason(seasonId),
          this.dbData.getChampionshipBySeason(seasonId)
        ]);
      } else {
        // Load data for latest season (default) concurrently
        [piloti, tracks, championshipData] = await Promise.all([
          this.dbData.getDriversData(),
          this.dbData.getAllTracksBySeason(),
          this.dbData.getChampionshipBySeason()
        ]);
      }
      
      this.piloti.set(piloti);
      this.tracks.set(tracks);
      this.championshipData.set(championshipData);
      
      this.initializeResults();
    } catch (error) {
      console.error('Errore durante il caricamento dei dati della stagione:', error);
      this.isSeasonLoading.set(false);
    } finally {
      this.isSeasonLoading.set(false);
    } 
  }

  async onSeasonChange(): Promise<void> {
    await this.loadSeasonData();
  }

  initializeResults(): void {
    const piloti = this.piloti();
    const pilotiMap = new Map(piloti.map(p => [p.username, p.id]));
    const raceMap = new Map<number, any[]>();
    const sprintMap = new Map<number, any[]>();
    const qualiMap = new Map<number, any[]>();
    const fpMap = new Map<number, any[]>();

    for (const gp of this.championshipData()) {
      const track = this.tracks().find(t => t.name === gp.track_name);
      if (!track) continue;

      const { track_id: trackId } = track;
      const isX2 = gp.gran_prix_has_x2 === 1;
      raceMap.set(trackId, this.buildRaceArray(
        isX2 ? gp.sessions.full_race : gp.sessions.race,
        piloti, pilotiMap,
        isX2 ? gp.fastLapDrivers.full_race : gp.fastLapDrivers.race
      ));
      sprintMap.set(trackId,
        gp.gran_prix_has_sprint === 1 && gp.sessions.sprint
          ? this.buildRaceArray(gp.sessions.sprint, piloti, pilotiMap, gp.fastLapDrivers.sprint)
          : []
      );
      qualiMap.set(trackId, this.buildSimpleArray(gp.sessions.qualifying, piloti, pilotiMap));
      fpMap.set(trackId, this.buildSimpleArray(gp.sessions.free_practice, piloti, pilotiMap));
    }

    this.raceResults.set(raceMap);
    this.sprintResults.set(sprintMap);
    this.qualiResults.set(qualiMap);
    this.fpResults.set(fpMap);
  }

  private buildRaceArray(
    session: SessionResult[] | undefined,
    piloti: Driver[],
    pilotiMap: Map<string, number>,
    fastLapDriver: string | undefined
  ): any[] {
    if (!session?.length)
      return [...Array(piloti.length).fill(0), 0, []];
    const positions = Array.from({ length: piloti.length }, (_, i) => {
      const driver = session.find(r => r.position === i + 1);
      return driver ? pilotiMap.get(driver.driver_username) ?? 0 : 0;
    });
    const fastLap = fastLapDriver ? pilotiMap.get(fastLapDriver) ?? 0 : 0;
    const dnf = session
      .filter(r => r.position === 0)
      .map(d => pilotiMap.get(d.driver_username))
      .filter((id): id is number => id !== undefined);
    return [...positions, fastLap, dnf];
  }

  private buildSimpleArray(
    session: SessionResult[] | undefined,
    piloti: Driver[],
    pilotiMap: Map<string, number>
  ): any[] {
    if (!session)
      return Array(piloti.length).fill(0);
    return Array.from({ length: piloti.length }, (_, i) => {
      const driver = session.find(r => r.position === i + 1);
      return driver ? pilotiMap.get(driver.driver_username) ?? 0 : 0;
    });
  }


  async publishResult(trackId: number, hasSprint: string, form: NgForm): Promise<void> {
    const seasonId = this.selectedSeason();
    if (!seasonId) throw new Error('Nessuna stagione selezionata');

    this.isSubmitting.update(s => ({ ...s, [trackId]: true }));
    this.formErrors.update(e => ({ ...e, [trackId]: [] }));
    this.formStatus.update(s => ({ ...s, [trackId]: 0 }));

    try {
      const hasSprintBool = hasSprint === '1';
      if (!this.formIsValid(trackId, hasSprintBool)) {
        this.formStatus.update(s => ({ ...s, [trackId]: 2 }));
        return;
      }

      const driverCount = this.driverCount();
      const raceData = this.raceResults().get(trackId)!;
      const sprintData = this.sprintResults().get(trackId)!;
      const gpResult: GpResult = {
        trackId,
        hasSprint: hasSprintBool,
        raceResult: raceData.slice(0, driverCount + 1).map(Number),
        raceDnfResult: (raceData[driverCount + 1] ?? []).map(Number),
        sprintResult: hasSprintBool ? sprintData.slice(0, driverCount + 1).map(Number) : [],
        sprintDnfResult: hasSprintBool ? (sprintData[driverCount + 1] ?? []).map(Number) : [],
        qualiResult: this.qualiResults().get(trackId)!.map(Number),
        fpResult: this.fpResults().get(trackId)!.map(Number),
        seasonId: +seasonId,
      };

      const result = await this.dbData.setGpResult(trackId, gpResult);
      this.handleBackendResult(trackId, result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Errore sconosciuto';
      this.formErrors.update(e => ({ ...e, [trackId]: [`Errore: ${msg}`] }));
      this.formStatus.update(s => ({ ...s, [trackId]: 3 }));
      console.error('Errore in publishResult:', error);
    } finally {
      this.isSubmitting.update(s => ({ ...s, [trackId]: false }));
    }
  }

  private handleBackendResult(trackId: number, result: unknown): void {
    if (typeof result !== 'string') {
      this.formStatus.update(s => ({ ...s, [trackId]: 1 }));
      return;
    }
    try {
      const parsed = JSON.parse(result);
      if (parsed.success) {
        this.formStatus.update(s => ({ ...s, [trackId]: 1 }));
      } else {
        const msg = parsed.message ?? 'Errore sconosciuto';
        this.formErrors.update(e => ({ ...e, [trackId]: [`Errore del server: ${msg}`] }));
        this.formStatus.update(s => ({ ...s, [trackId]: 3 }));
      }
    } catch {
      this.formStatus.update(s => ({ ...s, [trackId]: 1 }));
    }
  }

  formIsValid(trackId: number, hasSprint: boolean): boolean {
    const errors: string[] = [];
    const check = (v: { isValid: boolean; errors: string[] }, label: string): boolean =>
      this.collectSessionErrors(v, label, errors);

    const results = [
      check(this.validateSessionWithDnf(this.raceResults().get(trackId) ?? [], 'Gara'), 'Gara'),
      check(this.validateSessionNoDnf(this.qualiResults().get(trackId) ?? [], 'Qualifica'), 'Qualifica'),
      check(this.validateSessionNoDnf(this.fpResults().get(trackId) ?? [], 'Prove Libere'), 'Prove Libere'),
      ...(hasSprint ? [check(this.validateSessionWithDnf(this.sprintResults().get(trackId) ?? [], 'Sprint'), 'Sprint')] : []),
    ];

    this.formErrors.update(e => ({ ...e, [trackId]: errors }));
    return results.every(Boolean);
  }

  private collectSessionErrors(
    validation: { isValid: boolean; errors: string[] },
    label: string,
    acc: string[]
  ): boolean {
    if (!validation.isValid)
      validation.errors.forEach(e => acc.push(`${label}: ${e}`));
    return validation.isValid;
  }

  hasAllPlayersExactlyOnce(positions: number[]): boolean {
    return this.getDriverValidationErrors(positions).length === 0;
  }

  getDriverValidationErrors(positions: number[]): string[] {
    const errors: string[] = [];
    const piloti = this.piloti();
    const driverCount = piloti.length;
    const validPositions = positions.filter(p => Number(p) > 0).map(p => Number(p));
    const uniqueDrivers = new Set(validPositions);
    
    const validDriverIds = new Set(piloti.map(p => +p.id));

    if (validPositions.length !== uniqueDrivers.size)
      errors.push(`Alcuni piloti sono assegnati più volte`);

    if (uniqueDrivers.size < driverCount) {
      errors.push(`${driverCount - uniqueDrivers.size} pilota/i mancante/i dai risultati`);
    } else if (uniqueDrivers.size > driverCount) {
      errors.push(`Troppi piloti assegnati`);
    }

    for (const driverId of uniqueDrivers) {
      if (!validDriverIds.has(driverId)) {
        const driver = piloti.find(p => p.id == driverId);
        errors.push(`Pilota ${driver ? driver.username : `ID ${driverId}`} non esiste`);
        break;
      }
    }
    
    return errors;
  }

  validateSessionWithDnf(resultArray: any[], sessionName: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const n = this.driverCount();
    if (!resultArray || resultArray.length < n + 2) {
      errors.push(`Dati ${sessionName} incompleti`);
      return { isValid: false, errors };
    }

    const positions = resultArray.slice(0, n);
    const fastLap = resultArray[n];
    const dnf: number[] = resultArray.length > n + 1 && resultArray[n + 1] ? resultArray[n + 1].map((x: any) => Number(x)) : [];
    
    const nonZeroPositions = positions.filter(p => p !== 0);
    if (nonZeroPositions.length !== new Set(nonZeroPositions).size)
      errors.push(`Piloti duplicati trovati nelle posizioni`);

    if (!fastLap || fastLap === 0)
      errors.push(`Il pilota del giro veloce deve essere selezionato`);

    if (dnf.some(d => positions.includes(d)))
      errors.push(`I piloti DNF non possono essere anche nelle posizioni di gara`);

    const emptyPositionsNeeded = dnf.length;
    if (positions.slice(n - emptyPositionsNeeded).some(p => p !== 0))
      errors.push(`Le ultime ${emptyPositionsNeeded} posizioni devono essere vuote quando ${dnf.length} piloti sono DNF`);
    

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
    
    const n = this.driverCount();
    if (!resultArray || resultArray.length < n) {
      errors.push(`Dati ${sessionName} incompleti`);
      return { isValid: false, errors };
    }

    const positions = resultArray.slice(0, n);
    
    const nonZeroPositions = positions.filter(p => p !== 0);
    if (nonZeroPositions.length !== new Set(nonZeroPositions).size)
      errors.push(`Piloti duplicati trovati nelle posizioni`);

    if (positions.some(p => p === 0 || p === null || p === undefined))
      errors.push(`Tutte le posizioni devono essere compilate`);
    

    // Check all drivers are present exactly once
    if (!this.hasAllPlayersExactlyOnce(positions)) {
      const validationErrors = this.getDriverValidationErrors(positions);
      errors.push(...validationErrors);
    }

    return { isValid: errors.length === 0, errors };
  }

  private getResult(map: Map<number, any[]>, trackId: number, position: number): any {
    return (map.get(trackId) ?? [])[position - 1] ?? 0;
  }

  getRaceResult(trackId: number, position: number): any { return this.getResult(this.raceResults(), trackId, position); }
  getSprintResult(trackId: number, position: number): any { return this.getResult(this.sprintResults(), trackId, position); }
  getQualiResult(trackId: number, position: number): any { return this.getResult(this.qualiResults(), trackId, position); }
  getFpResult(trackId: number, position: number): any { return this.getResult(this.fpResults(), trackId, position); }

  private updateResultMap(
    resultSignal: WritableSignal<Map<number, any[]>>,
    trackId: number,
    position: number,
    value: any,
    withDnfSlot = false
  ): void {
    if (!value) return;
    resultSignal.update(results => {
      const newResults = new Map(results);
      const arr = newResults.get(trackId) ?? [];
      if (!newResults.has(trackId)) newResults.set(trackId, arr);
      const idx = position - 1;
      arr[idx] = withDnfSlot && idx >= this.driverCount() + 1 ? value : +value;
      return newResults;
    });
  }

  setRaceResult(trackId: number, position: number, value: any): void { this.updateResultMap(this.raceResults, trackId, position, value, true); }
  setSprintResult(trackId: number, position: number, value: any): void { this.updateResultMap(this.sprintResults, trackId, position, value, true); }
  setQualiResult(trackId: number, position: number, value: any): void { this.updateResultMap(this.qualiResults, trackId, position, value); }
  setFpResult(trackId: number, position: number, value: any): void { this.updateResultMap(this.fpResults, trackId, position, value); }

}
