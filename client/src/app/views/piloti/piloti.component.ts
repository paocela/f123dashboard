import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DbDataService } from '../../service/db-data.service';
import { ConstructorService } from '../../service/constructor.service';
import { 
  ColComponent,
  RowComponent,
  Tabs2Module,
} from '@coreui/angular';
import type { Constructor, DriverData } from '@f123dashboard/shared';
import { PilotCardComponent } from '../../components/pilot-card/pilot-card.component';
import { ConstructorCardComponent } from '../../components/constructor-card/constructor-card.component';

@Component({
    selector: 'app-cards',
    templateUrl: './piloti.component.html',
    styleUrls: ['./piloti.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    Tabs2Module,
    PilotCardComponent,
    ConstructorCardComponent
]
})

export class PilotiComponent implements OnInit {
  private dbData = inject(DbDataService);
  private cdr = inject(ChangeDetectorRef);
  private constructorService = inject(ConstructorService);


  piloti: DriverData[] = [];
  constructors: Constructor[] = [];
  isLoading = true;

  ngOnInit() {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      // Fetch data from service
      this.piloti = this.dbData.getAllDrivers();
      this.constructors = this.dbData.getConstructors();

      // Calculate points for constructors based on drivers data
      this.constructors = this.constructorService.calculateConstructorPoints(this.constructors, this.piloti);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

}
