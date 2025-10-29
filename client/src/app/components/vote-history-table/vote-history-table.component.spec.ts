import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteHistoryTableComponent } from './vote-history-table.component';

describe('VoteHistoryTableComponent', () => {
  let component: VoteHistoryTableComponent;
  let fixture: ComponentFixture<VoteHistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoteHistoryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoteHistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
