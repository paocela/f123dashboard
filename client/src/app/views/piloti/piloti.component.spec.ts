import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { ButtonModule, CardModule, GridModule, ListGroupModule, NavModule, UtilitiesModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../app/icons/icon-subset';
import { PilotiComponent } from './piloti.component';

describe('PilotiComponent', () => {
  let component: PilotiComponent;
  let fixture: ComponentFixture<PilotiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PilotiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PilotiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});