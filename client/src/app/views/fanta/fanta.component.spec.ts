import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { FantaComponent } from './fanta.component';

describe('FantaComponent', () => {
  let component: FantaComponent;
  let fixture: ComponentFixture<FantaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideNoopAnimations(), ],
      imports: [FantaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FantaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
