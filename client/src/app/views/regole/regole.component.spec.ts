import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegoleComponent } from './regole.component';

describe('RegoleComponent', () => {
  let component: RegoleComponent;
  let fixture: ComponentFixture<RegoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
