import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DbDataService } from '../../service/db-data.service';
import { 
  ColComponent,
  RowComponent,
  Tabs2Module,
} from '@coreui/angular';
import { Constructor, DriverData } from '@genezio-sdk/f123dashboard';
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
      this.calculateConstructorPoints();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Calculates all points types for each constructor based on their drivers' data
   */
  calculateConstructorPoints(): void {
    this.constructors.forEach(constructor => {
      // Find the drivers for this constructor
      const driver1 = this.piloti.find(p => p.driver_username === constructor.driver_1_username);
      const driver2 = this.piloti.find(p => p.driver_username === constructor.driver_2_username);

      if (driver1 && driver2) {
        // Sum session points 
        constructor.constructor_race_points = Number(driver1.total_race_points ?? 0) + Number(driver2.total_race_points ?? 0);
        constructor.constructor_full_race_points = Number(driver1.total_full_race_points ?? 0) + Number(driver2.total_full_race_points ?? 0);
        constructor.constructor_sprint_points = Number(driver1.total_sprint_points ?? 0) + Number(driver2.total_sprint_points ?? 0);
        constructor.constructor_qualifying_points = Number(driver1.total_qualifying_points ?? 0) + Number(driver2.total_qualifying_points ?? 0);
        constructor.constructor_free_practice_points = Number(driver1.total_free_practice_points ?? 0) + Number(driver2.total_free_practice_points ?? 0);

        constructor.constructor_tot_points = Number(driver1.total_points ?? 0) + Number(driver2.total_points ?? 0);
      }
    });

    // Sort constructors by total points
    this.constructors.sort((a, b) => b.constructor_tot_points - a.constructor_tot_points);
  }
}
