import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkBoxComponent } from './link-box.component';

describe('LinkBoxComponent', () => {
  let component: LinkBoxComponent;
  let fixture: ComponentFixture<LinkBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});