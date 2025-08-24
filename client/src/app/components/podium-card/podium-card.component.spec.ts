import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlboDOroCardComponent } from './albo-d-oro-card.component';

describe('AlboDOroCardComponent', () => {
  let component: AlboDOroCardComponent;
  let fixture: ComponentFixture<AlboDOroCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlboDOroCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlboDOroCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
