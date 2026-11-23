import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import type { CumulativePointsData, TrackData } from '@f123dashboard/shared';

import { ChampionshipTrendComponent } from './championship-trend.component';
import { DbDataService } from '../../service/db-data.service';

describe('ChampionshipTrendComponent', () => {
  let component: ChampionshipTrendComponent;
  let fixture: ComponentFixture<ChampionshipTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideNoopAnimations(), ],
      imports: [ChampionshipTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChampionshipTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates the chart when a radio selection changes from the keyboard', () => {
    const tracks: TrackData[] = ['IT', 'GB', 'ES', 'FR', 'JP'].map((country, index) => ({
      track_id: index + 1,
      name: `track${index + 1}`,
      country,
      date: '2026-01-01',
      has_sprint: 0,
      has_x2: 0,
      besttime_driver_time: '',
      username: ''
    }));
    const points: CumulativePointsData[] = [
      { id: 1, name: 'first', scores: [50, 40, 30, 20, 10] },
      { id: 2, name: 'second', scores: [30, 22, 17, 11, 4] }
    ].flatMap(driver => driver.scores.map((score, index) => ({
      date: '2026-01-01',
      track_name: tracks[4 - index].name,
      driver_id: driver.id,
      driver_username: driver.name,
      driver_color: '#000000',
      cumulative_points: score
    })));
    const dbData = TestBed.inject(DbDataService);
    spyOn(dbData, 'tracks').and.returnValue(tracks);
    spyOn(dbData, 'cumulativePoints').and.returnValue(points);
    component.setTrafficPeriod('Year', 0);
    expect(component.mainChart.data?.labels).toEqual(['IT', 'GB', 'ES', 'FR', 'JP']);

    const radio: HTMLInputElement = fixture.nativeElement.querySelector('#radio4Month');
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));

    expect(component.mainChart.data?.labels).toEqual(['GB', 'ES', 'FR', 'JP']);
    expect(component.mainChart.data?.datasets.map(dataset => ({ label: dataset.label, data: dataset.data })))
      .toEqual([
        { label: 'first', data: [0, 10, 20, 30] },
        { label: 'second', data: [0, 6, 11, 19] }
      ]);

    const allRacesLabel: HTMLLabelElement = fixture.nativeElement.querySelector('label[for="radioYear"]');
    allRacesLabel.click();
    expect(component.mainChart.data?.labels).toEqual(['IT', 'GB', 'ES', 'FR', 'JP']);
  });
});
