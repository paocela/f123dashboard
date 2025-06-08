import { Component } from '@angular/core';
import { LeaderboardComponent } from "../../../components/leaderboard/leaderboard.component";
import { LoginComponent } from '../../../components/login/login.component';
import { GridModule } from '@coreui/angular';

@Component({
  selector: 'app-fanta-dashboard',
  standalone: true,
  imports: [
    GridModule,
    LoginComponent,
    LeaderboardComponent
  ],
  templateUrl: './fanta-dashboard.component.html',
  styleUrl: './fanta-dashboard.component.scss'
})
export class FantaDashboardComponent {

}
