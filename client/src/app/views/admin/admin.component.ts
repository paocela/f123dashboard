import { Component } from '@angular/core';
import { LoginComponent } from '../../../components/login/login.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    LoginComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

}
