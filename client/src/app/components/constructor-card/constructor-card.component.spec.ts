import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructorCardComponent } from './constructor-card.component';

describe('ConstructorCardComponent', () => {
  let component: ConstructorCardComponent;
  let fixture: ComponentFixture<ConstructorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstructorCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstructorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
