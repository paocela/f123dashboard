import { Component } from '@angular/core';

@Component({
  selector: 'app-fanta',
  standalone: true,
  imports: [],
  templateUrl: './fanta.component.html',
  styleUrl: './fanta.component.scss'
})
export class FantaComponent {
  username: any = '';
  ngOnInit(): void {

      this.username = sessionStorage.getItem('user');
      
    
  }
}