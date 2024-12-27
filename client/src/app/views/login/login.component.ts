import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';    
import { FormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import { GridModule } from '@coreui/angular';
import { ButtonDirective } from '@coreui/angular';
import { PilotiComponent } from "../piloti/piloti.component";
import { LeaderboardComponent } from "../../../components/leaderboard/leaderboard.component";
import { DbDataService } from 'src/app/service/db-data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    FormsModule,
    FormModule,
    ButtonDirective,
    GridModule,
    LeaderboardComponent
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoggedIn : any = 'false';
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  onLogin() {
    if (this.authService.login(this.username, this.password)) {
      sessionStorage.setItem('isLoggedIn', 'true'); // Salva lo stato del login
      this.router.navigate(['/fanta']);          // Naviga verso la componente protetta
    } else {
      this.errorMessage = 'Credenziali non valide!';
    }
  }

  ngOnInit(): void {
    this.isLoggedIn = sessionStorage.getItem('isLoggedIn');
    console.log('is logged in ' + this.isLoggedIn)
    if( this.isLoggedIn === 'true'){
      console.log('logged in as ' + sessionStorage.getItem('username'))
      this.router.navigate(['/fanta']);
    }
  }

}