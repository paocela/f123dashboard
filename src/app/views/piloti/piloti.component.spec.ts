import { ComponentFixture, TestBed } from '@angular/core/testing';

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
