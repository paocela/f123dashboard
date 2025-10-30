import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PilotCardComponent } from './pilot-card.component';

describe('PilotCardComponent', () => {
  let component: PilotCardComponent;
  let fixture: ComponentFixture<PilotCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PilotCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PilotCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
