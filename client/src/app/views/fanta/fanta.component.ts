import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';    
import { FormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import { GridModule } from '@coreui/angular';
import { ButtonDirective, AvatarComponent } from '@coreui/angular';
import { DbDataService } from 'src/app/service/db-data.service';

@Component({
  selector: 'app-fanta',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    FormsModule,
    FormModule,
    ButtonDirective,
    GridModule,
    AvatarComponent
  ],
  templateUrl: './fanta.component.html',
  styleUrl: './fanta.component.scss'
})
export class FantaComponent {
  username: any = '';
  piloti: any[] = [];
  posizioni = new Map<number, string>([
    [1, "primo"],
    [2, "secondo"],
    [3, "terzo"],
    [4, "quarto"],
    [5, "quinto"],
    [6, "sesto"]
]);

medals = new Map<number, string>([
  [1, "medal_first.png"],
  [2, "medal_second.png"],
  [3, "medal_third.png"]
]);

  constructor(public authService: AuthService, private router: Router, private dbData: DbDataService){}

  ngOnInit(): void {
      this.username = sessionStorage.getItem('user');
      this.piloti = this.dbData.getAllDrivers();
      console.log(this.piloti);
      console.log(this.posizioni);
  }

  logout(){
    this.authService.logout()
    this.router.navigate(['/']);
  }

}