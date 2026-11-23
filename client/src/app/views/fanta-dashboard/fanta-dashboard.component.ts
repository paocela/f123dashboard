import { Component } from '@angular/core';
import { LeaderboardComponent } from "../../components/leaderboard/leaderboard.component";
import { GridModule } from '@coreui/angular';

@Component({
  selector: 'app-fanta-dashboard',
  imports: [
    GridModule,
    LeaderboardComponent
  ],
  templateUrl: './fanta-dashboard.component.html'
})
export class FantaDashboardComponent {

}
