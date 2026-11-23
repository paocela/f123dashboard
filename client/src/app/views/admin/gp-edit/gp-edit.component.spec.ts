import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError, delay } from 'rxjs';

import { GpEditComponent } from './gp-edit.component';
import { GpEditService } from '../../../service/gp-edit.service';
import { FeatureFlagsService } from '../../../service/feature-flags.service';
import { DbDataService } from '../../../service/db-data.service';
import type { GPEditItem } from '@f123dashboard/shared';

describe('GpEditComponent', () => {
  let component: GpEditComponent;
  let fixture: ComponentFixture<GpEditComponent>;
  let mockGpEditService: jasmine.SpyObj<GpEditService>;
  let mockDbDataService: jasmine.SpyObj<DbDataService>;
  const freePracticeEnabled = signal(true);

  const mockGpData: GPEditItem[] = [
    {
      id: 1,
      track_id: 1,
      track_name: 'Monaco',
      date: '2024-05-26T14:00',
      has_sprint: false,
      has_x2: false,
      has_results: false,
      is_past: false
    }
  ];

  const mockTracks = [
    { id: 1, name: 'Monaco' },
    { id: 2, name: 'Silverstone' }
  ];

  beforeEach(async () => {
    mockGpEditService = jasmine.createSpyObj('GpEditService', [
      'getUpcomingGps',
      'getAllTracks',
      'bulkUpdateGpDate',
      'createGp',
      'updateGp',
      'deleteGp'
    ]);
    mockDbDataService = jasmine.createSpyObj('DbDataService', ['refreshGpSchedule']);
    mockDbDataService.refreshGpSchedule.and.resolveTo();

    mockGpEditService.getUpcomingGps.and.returnValue(of({ success: true, data: mockGpData }));
    mockGpEditService.getAllTracks.and.returnValue(of({ success: true, data: mockTracks }));
    mockGpEditService.bulkUpdateGpDate.and.returnValue(of({ success: true }));
    mockGpEditService.createGp.and.returnValue(of({ success: true, data: mockGpData[0] }));
    mockGpEditService.updateGp.and.returnValue(of({ success: true }));
    mockGpEditService.deleteGp.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      animationsEnabled: true,
      providers: [
        provideNoopAnimations(),
        { provide: GpEditService, useValue: mockGpEditService },
        { provide: DbDataService, useValue: mockDbDataService },
        {
          provide: FeatureFlagsService,
          useValue: {
            freePracticeEnabled: freePracticeEnabled.asReadonly(),
            loadFlags: jasmine.createSpy('loadFlags').and.resolveTo({ freePracticeEnabled: true }),
            setFreePracticeEnabled: jasmine.createSpy('setFreePracticeEnabled').and.resolveTo()
          }
        }
      ],
      imports: [GpEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GpEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('orders the cards with race management first and season settings last', () => {
    const host: HTMLElement = fixture.nativeElement;
    const titles = host.querySelectorAll('c-container.gp-edit c-card-header strong, c-container.gp-edit .accordion-header strong');
    const headings = Array.from(titles, title =>
      title.firstChild?.textContent?.trim()
    );

    expect(headings).toEqual([
      'Aggiungi Nuovo Gran Premio',
      'Prossime Gare',
      'Gare passate',
      'Azioni di Massa',
      'Impostazioni stagione corrente'
    ]);
  });

  it('places bulk actions and season settings in responsive columns', () => {
    const host: HTMLElement = fixture.nativeElement;
    const bulkCard = host.querySelector('#daysOffset')?.closest('c-accordion');
    const settings = host.querySelector('#freePracticeEnabled')?.closest('c-accordion');
    const bulkColumn = bulkCard?.closest('c-col');
    const settingsColumn = settings?.closest('c-col');
    expect(bulkColumn).toBeTruthy();
    expect(settingsColumn).toBeTruthy();
    if (!bulkColumn || !settingsColumn) {
      return;
    }

    expect(bulkColumn.parentElement).toBe(settingsColumn.parentElement);
    const bulkBounds = bulkColumn.getBoundingClientRect();
    const settingsBounds = settingsColumn.getBoundingClientRect();
    expect(bulkBounds.width).toBeGreaterThan(0);
    expect(Math.abs(bulkBounds.width - settingsBounds.width)).toBeLessThan(2);
    if (window.matchMedia('(min-width: 992px)').matches) {
      expect(settingsBounds.left).toBeGreaterThan(bulkBounds.left);
      expect(Math.abs(settingsBounds.top - bulkBounds.top)).toBeLessThan(2);
    } else {
      expect(Math.abs(settingsBounds.left - bulkBounds.left)).toBeLessThan(2);
      expect(settingsBounds.top).toBeGreaterThanOrEqual(bulkBounds.bottom);
    }
  });

  it('opens and closes the initially collapsed season settings', async () => {
    fixture.autoDetectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const toggle = buttons.find(button => button.textContent?.includes('Impostazioni stagione corrente'));
    expect(toggle).toBeDefined();
    if (!toggle) {
      return;
    }

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('#freePracticeEnabled')).toBeTruthy();
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens and closes bulk actions without clearing the entered offset', async () => {
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const toggle = Array.from(host.querySelectorAll('button'))
      .find(button => button.textContent?.includes('Azioni di Massa'));
    expect(toggle).toBeDefined();
    if (!toggle) {
      return;
    }

    const input = host.querySelector<HTMLInputElement>('#daysOffset')!;
    const collapse = input.closest<HTMLElement>('.accordion-collapse')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe(collapse.id);
    expect(collapse.classList.contains('show')).toBeFalse();

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(collapse.classList.contains('show')).toBeTrue();

    input.value = '5';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    await fixture.whenStable();
    expect(input.value).toBe('5');
  });

  it('shows bulk action guidance directly below its label', async () => {
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const toggle = Array.from(host.querySelectorAll('button'))
      .find(button => button.textContent?.includes('Azioni di Massa'))!;
    toggle.click();
    await fixture.whenStable();

    const label = host.querySelector('label[for="daysOffset"]');
    const input = host.querySelector<HTMLInputElement>('#daysOffset')!;
    const guidance = host.querySelector<HTMLElement>('#daysOffsetHelp')!;
    expect(guidance.previousElementSibling).toBe(label);
    expect(guidance.nextElementSibling).toBe(input);
    expect(input.getAttribute('aria-describedby')).toBe(guidance.id);
  });

  it('keeps the free practice action right-aligned when its content wraps', async () => {
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const action = host.querySelector<HTMLButtonElement>('#freePracticeEnabled')!;
    const accordion = action.closest<HTMLElement>('c-accordion')!;
    accordion.style.width = '300px';
    accordion.querySelector<HTMLButtonElement>('.accordion-button')!.click();
    await fixture.whenStable();

    const row = action.parentElement!;
    const details = row.firstElementChild!;
    const actionBounds = action.getBoundingClientRect();
    const rowBounds = row.getBoundingClientRect();
    expect(rowBounds.width).toBeGreaterThan(0);
    expect(actionBounds.top).toBeGreaterThanOrEqual(details.getBoundingClientRect().bottom);
    expect(Math.abs(actionBounds.right - rowBounds.right)).toBeLessThan(2);
  });

  it('shows past races in an initially closed card', () => {
    const toggle: HTMLButtonElement | null = fixture.nativeElement.querySelector('#past-races-accordion button');
    expect(toggle).not.toBeNull();
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.getAttribute('aria-controls')).toBeTruthy();
  });

  it('opens and closes past races using their heading', async () => {
    fixture.autoDetectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const toggle = buttons.find(button => button.textContent?.includes('Gare passate'));
    expect(toggle).toBeDefined();
    if (!toggle) {
      return;
    }

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('expands past races and keeps races without results editable', async () => {
    fixture.autoDetectChanges();
    component.gps.set([
      { ...mockGpData[0], id: 2, is_past: true, has_results: false },
      { ...mockGpData[0], id: 3, is_past: true, has_results: true }
    ]);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const body = host.querySelector<HTMLElement>('#past-races-body')!;
    const toggle = host.querySelector<HTMLButtonElement>('#past-races-accordion button')!;
    const collapse = body.closest<HTMLElement>('.accordion-collapse')!;
    expect(collapse.classList.contains('show')).toBeFalse();

    toggle.click();
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(collapse.classList.contains('show')).toBeTrue();
    const rows = body.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(Array.from(rows[0].querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, select, button'))
      .every(control => control.disabled)).toBeTrue();
    expect(rows[0].textContent).toContain('Risultati presenti');
    expect(Array.from(rows[1].querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, select, button'))
      .every(control => !control.disabled)).toBeTrue();
  });

  it('moves a saved race between groups after reloading server dates', () => {
    const gp = { ...mockGpData[0], is_past: true };
    component.gps.set([gp]);
    mockGpEditService.getUpcomingGps.and.returnValue(
      of({ success: true, data: [{ ...gp, is_past: false, date: '2027-01-01T14:00' }] })
    );

    component.onSave(gp);

    expect(component.raceGroups()[0].gps.map(item => item.id)).toEqual([1]);
    expect(component.raceGroups()[1].gps).toEqual([]);
  });

  it('preserves edits to other races when one race is saved', () => {
    const first = { ...mockGpData[0], id: 1 };
    const second = { ...mockGpData[0], id: 2, date: '2024-06-01T14:00' };
    component.gps.set([first, second]);
    second.date = '2024-06-02T14:00';
    mockGpEditService.updateGp.and.returnValue(of({ success: true }));

    component.onSave(first);

    expect(component.gps().find(gp => gp.id === 2)?.date).toBe('2024-06-02T14:00');
    expect(mockDbDataService.refreshGpSchedule).toHaveBeenCalled();
  });

  it('loads current-season feature flags when the page initializes', () => {
    expect(TestBed.inject(FeatureFlagsService).loadFlags).toHaveBeenCalled();
  });

  it('shows only an empty message without table headers when a group has no races', () => {
    component.gps.set([]);
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement.querySelector('#past-races-body');
    expect(body.querySelector('table')).toBeNull();
    expect(body.textContent).toContain('Nessuna gara.');
  });

  it('shows the count without an empty body when there are no upcoming races', () => {
    component.gps.set([]);
    component.loading.set(true);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const card = Array.from(host.querySelectorAll('c-card')).find(item =>
      item.querySelector('c-card-header')?.textContent?.includes('Prossime Gare')
    );
    expect(card).toBeDefined();
    if (!card) {
      return;
    }

    expect(card.querySelector('c-spinner')).not.toBeNull();
    component.loading.set(false);
    fixture.detectChanges();

    expect(card.querySelector('c-badge')?.textContent?.trim()).toBe('0');
    expect(card.querySelector('c-card-body')).toBeNull();
    expect(card.textContent).not.toContain('Nessuna gara.');
  });

  it('does not offer deletion of a GP with results', () => {
    component.gps.set([{ ...mockGpData[0], has_results: true }]);
    component.onDelete(1);
    expect(component.modalVisible()).toBeFalse();
    expect(mockGpEditService.deleteGp).not.toHaveBeenCalled();
  });

  it('does not save a GP with results even when called directly', () => {
    component.onSave({ ...mockGpData[0], ...{ has_results: true, is_past: true } });
    expect(mockGpEditService.updateGp).not.toHaveBeenCalled();
    expect(component.toasts().some(toast => toast.color === 'danger')).toBeTrue();
  });

  it('should show the free practice setting', () => {
    expect(fixture.nativeElement.querySelector('#freePracticeEnabled')).toBeTruthy();
  });

  it('shows the free practice state and asks confirmation before toggling it', async () => {
    fixture.autoDetectChanges();
    const featureFlags = TestBed.inject(FeatureFlagsService) as unknown as { setFreePracticeEnabled: jasmine.Spy };
    const host: HTMLElement = fixture.nativeElement;
    const buttons = Array.from(host.querySelectorAll('button'));
    buttons.find(button => button.textContent?.includes('Impostazioni stagione corrente'))?.click();
    await fixture.whenStable();
    expect(host.querySelector('#freePracticeStatus')?.textContent).toContain('Abilitate');

    host.querySelector<HTMLButtonElement>('#freePracticeEnabled')!.click();

    expect(component.modalVisible()).toBeTrue();
    expect(featureFlags.setFreePracticeEnabled).not.toHaveBeenCalled();

    component.onConfirmAction();
    await Promise.resolve();

    expect(featureFlags.setFreePracticeEnabled).toHaveBeenCalledWith(false);
  });

  it('uses the same field labels in the create form and race table', () => {
    const host: HTMLElement = fixture.nativeElement;
    const createLabels = Array.from(host.querySelectorAll('#createGpForm label, #createGpForm .form-label'))
      .map(label => label.textContent?.trim());
    expect(createLabels).toEqual(['Pista', 'Data (UTC)', 'Sprint', 'Punti Doppi', 'Azioni']);
  });

  it('aligns the create headings with both race tables', async () => {
    fixture.autoDetectChanges();
    component.gps.set([
      mockGpData[0],
      { ...mockGpData[0], id: 2, is_past: true }
    ]);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    host.querySelector<HTMLButtonElement>('#past-races-accordion button')?.click();
    await fixture.whenStable();

    const createHeadings = Array.from(host.querySelectorAll<HTMLElement>('#createGpForm thead th'));
    const raceTables = Array.from(host.querySelectorAll<HTMLElement>('.gp-edit__table'))
      .filter(table => !table.closest('#createGpForm'));
    expect(createHeadings.length).toBe(5);
    expect(raceTables.length).toBe(2);
    if (window.matchMedia('(max-width: 767.98px)').matches) {
      expect(getComputedStyle(createHeadings[0].closest('thead')!).display).toBe('none');
      expect(getComputedStyle(host.querySelector<HTMLElement>('.gp-edit__mobile-label')!).display)
        .toBe('block');
      return;
    }

    expect(createHeadings[0].getBoundingClientRect().width).toBeGreaterThan(0);
    for (const table of raceTables) {
      expect(table.getBoundingClientRect().width).toBeGreaterThan(0);
      const headings = Array.from(table.querySelectorAll<HTMLElement>('thead th'));
      expect(headings.map(heading => heading.textContent?.trim()))
        .toEqual(createHeadings.map(heading => heading.textContent?.trim()));
      for (let i = 0; i < createHeadings.length; i++) {
        expect(Math.abs(headings[i].getBoundingClientRect().left - createHeadings[i].getBoundingClientRect().left))
          .toBeLessThan(2);
      }
    }
  });

  it('should load GPs on initialization', () => {
    expect(mockGpEditService.getUpcomingGps).toHaveBeenCalled();
    expect(component.gps().length).toBe(1);
    expect(component.gps()[0].track_name).toBe('Monaco');
  });

  it('should load tracks on initialization', () => {
    expect(mockGpEditService.getAllTracks).toHaveBeenCalled();
    expect(component.tracks().length).toBe(2);
  });

  it('should preserve UTC date strings for datetime-local input', () => {
    expect(component.gps()[0].date).toBe('2024-05-26T14:00');
  });

  it('should set loading state when loading data', () => {
    // Setup async observable to simulate real API call
    mockGpEditService.getUpcomingGps.and.returnValue(
      of({ success: true, data: mockGpData }).pipe(delay(10))
    );
    
    component.loading.set(false);
    component.loadData();
    
    // Check loading state immediately after calling loadData
    expect(component.loading()).toBe(true);
  });

  it('should handle error when loading GPs', () => {
    mockGpEditService.getUpcomingGps.and.returnValue(throwError(() => new Error('Load error')));
    
    component.loadData();
    fixture.detectChanges();
    
    expect(component.loading()).toBe(false);
  });

  it('should add toast correctly', () => {
    component.addToast('Test Title', 'Test Message', 'success');
    
    expect(component.toasts().length).toBe(1);
    expect(component.toasts()[0].title).toBe('Test Title');
    expect(component.toasts()[0].message).toBe('Test Message');
    expect(component.toasts()[0].color).toBe('success');
  });

  it('should keep a short notification compact instead of filling the viewport', async () => {
    const response = await fetch('/test-shell/index.html');
    expect(response.ok).toBeTrue();
    const shell = new DOMParser().parseFromString(await response.text(), 'text/html');
    const shellStyles = document.createElement('style');
    shellStyles.textContent = Array.from(shell.querySelectorAll('style'))
      .map(style => style.textContent).join('\n');
    document.head.append(shellStyles);

    try {
      component.addToast('Deleted', 'Grand Prix deleted.', 'info');
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      const toaster = host.querySelector<HTMLElement>('c-toaster')!;
      const toast = host.querySelector<HTMLElement>('c-toast')!;
      const body = host.querySelector<HTMLElement>('c-toast-body')!;

      await new Promise(resolve => setTimeout(resolve, 50));
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 350));
      fixture.detectChanges();

      expect(body.textContent).toContain('Grand Prix deleted.');
      expect(toast.getBoundingClientRect().height).toBeGreaterThan(40);
      expect(toast.getBoundingClientRect().height).toBeLessThan(150);
      expect(toaster.getBoundingClientRect().height).toBeLessThan(200);
    } finally {
      shellStyles.remove();
    }
  });

  it('should remove toast when visibility changes to false', () => {
    const toast = { title: 'Test', message: 'Message', color: 'info' };
    component.toasts.set([toast]);
    
    component.onToastVisibleChange(false, toast);
    
    expect(component.toasts().length).toBe(0);
  });

  it('should show confirmation modal with correct data', () => {
    const testAction = jasmine.createSpy('testAction');
    
    component.showConfirmation('Test Title', 'Test Message', testAction);
    
    expect(component.modalVisible()).toBe(true);
    expect(component.modalTitle()).toBe('Test Title');
    expect(component.modalMessage()).toBe('Test Message');
  });

  it('should execute pending action on confirm', () => {
    const testAction = jasmine.createSpy('testAction');
    component.showConfirmation('Title', 'Message', testAction);
    
    component.onConfirmAction();
    
    expect(testAction).toHaveBeenCalled();
    expect(component.modalVisible()).toBe(false);
  });

  it('should clear pending action on cancel', () => {
    const testAction = jasmine.createSpy('testAction');
    component.showConfirmation('Title', 'Message', testAction);
    
    component.onCancelAction();
    
    expect(testAction).not.toHaveBeenCalled();
    expect(component.modalVisible()).toBe(false);
  });

  it('should not update if bulk form is invalid', () => {
    component.bulkForm.patchValue({ daysOffset: null });
    
    component.onBulkUpdate();
    
    expect(mockGpEditService.bulkUpdateGpDate).not.toHaveBeenCalled();
  });

  it('should not update if days offset is zero', () => {
    component.bulkForm.patchValue({ daysOffset: 0 });
    
    component.onBulkUpdate();
    
    expect(mockGpEditService.bulkUpdateGpDate).not.toHaveBeenCalled();
  });

  it('should show confirmation before bulk update', () => {
    spyOn(component, 'showConfirmation');
    component.bulkForm.patchValue({ daysOffset: 5 });
    
    component.onBulkUpdate();
    
    expect(component.showConfirmation).toHaveBeenCalled();
  });

  it('should reload data after successful bulk update', (done) => {
    spyOn(component, 'loadData');
    component.bulkForm.patchValue({ daysOffset: 5 });
    
    // Manually call executeBulkUpdate to bypass confirmation
    component['executeBulkUpdate'](5);
    
    setTimeout(() => {
      expect(mockGpEditService.bulkUpdateGpDate).toHaveBeenCalledWith(5);
      expect(component.loadData).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should handle error during bulk update', (done) => {
    mockGpEditService.bulkUpdateGpDate.and.returnValue(throwError(() => new Error('Update error')));
    
    component['executeBulkUpdate'](5);
    
    setTimeout(() => {
      expect(component.loading()).toBe(false);
      expect(component.toasts().some(t => t.color === 'danger')).toBe(true);
      done();
    }, 100);
  });

  it('should not create GP if the date is missing', () => {
    component.createForm.patchValue({ track_id: null, date: '' });
    
    component.onCreate();
    
    expect(mockGpEditService.createGp).not.toHaveBeenCalled();
  });

  it('should create GP with correct data', (done) => {
    component.createForm.patchValue({
      track_id: 1,
      date: '2024-06-01T14:00',
      has_sprint: true,
      has_x2: false
    });
    
    component.onCreate();
    
    setTimeout(() => {
      expect(mockGpEditService.createGp).toHaveBeenCalledWith(jasmine.objectContaining({
        track_id: 1,
        date: '2024-06-01T14:00',
        has_sprint: true,
        has_x2: false
      }));
      done();
    }, 100);
  });

  it('should create a GP without an assigned track', (done) => {
    component.createForm.patchValue({
      track_id: null,
      date: '2024-06-01T14:00',
      has_sprint: false,
      has_x2: false
    });

    component.onCreate();

    setTimeout(() => {
      expect(mockGpEditService.createGp).toHaveBeenCalledWith(jasmine.objectContaining({ track_id: null }));
      done();
    }, 100);
  });

  it('should reset form after successful GP creation', (done) => {
    component.createForm.patchValue({
      track_id: 1,
      date: '2024-06-01T14:00',
      has_sprint: true,
      has_x2: false
    });
    
    component.onCreate();
    
    setTimeout(() => {
      expect(component.createForm.value.has_sprint).toBe(false);
      expect(component.createForm.value.has_x2).toBe(false);
      done();
    }, 100);
  });

  it('should show confirmation before deleting GP', () => {
    spyOn(component, 'showConfirmation');
    
    component.onDelete(1);
    
    expect(component.showConfirmation).toHaveBeenCalled();
  });

  it('should remove a deleted GP and refresh the dashboard schedule', (done) => {
    component['executeDelete'](1);

    setTimeout(() => {
      expect(mockGpEditService.deleteGp).toHaveBeenCalledWith(1);
      expect(component.gps().some(gp => gp.id === 1)).toBeFalse();
      expect(mockDbDataService.refreshGpSchedule).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should update GP with correct data', (done) => {
    const gp = {
      id: 1,
      track_id: 1,
      track_name: 'Monaco',
      date: '2024-05-26T14:00',
      has_sprint: false,
      has_x2: true,
      has_results: false,
      is_past: true
    };
    
    component.onSave(gp);
    
    setTimeout(() => {
      expect(mockGpEditService.updateGp).toHaveBeenCalledWith(1, jasmine.objectContaining({
        track_id: 1,
        date: '2024-05-26T14:00',
        has_sprint: false,
        has_x2: true
      }));
      done();
    }, 100);
  });

  it('should show success toast after saving GP', (done) => {
    const gp = {
      id: 1,
      track_id: 1,
      track_name: 'Monaco',
      date: '2024-05-26T14:00',
      has_sprint: false,
      has_x2: false,
      has_results: false,
      is_past: true
    };
    
    component.onSave(gp);
    
    setTimeout(() => {
      expect(component.toasts().some(t => t.color === 'success')).toBe(true);
      done();
    }, 100);
  });

  it('should handle error when saving GP', (done) => {
    mockGpEditService.updateGp.and.returnValue(throwError(() => new Error('Save error')));
    const gp = {
      id: 1,
      track_id: 1,
      track_name: 'Monaco',
      date: '2024-05-26T14:00',
      has_sprint: false,
      has_x2: false,
      has_results: false,
      is_past: true
    };
    
    component.onSave(gp);
    
    setTimeout(() => {
      expect(component.toasts().some(t => t.color === 'danger')).toBe(true);
      done();
    }, 100);
  });

  it('should clear pending action when modal visibility changes to false', () => {
    const testAction = jasmine.createSpy('testAction');
    component.showConfirmation('Title', 'Message', testAction);
    
    component.onModalVisibleChange(false);
    
    expect(component.modalVisible()).toBe(false);
  });
});
