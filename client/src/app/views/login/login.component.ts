import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';    
import { FormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import { GridModule, ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, ModalToggleDirective} from '@coreui/angular';
import { LeaderboardComponent } from "../../../components/leaderboard/leaderboard.component";
import { DbDataService } from 'src/app/service/db-data.service';
import { FantaPlayer } from '../../model/fanta';

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
    LeaderboardComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent, 
    ModalFooterComponent,
    ModalToggleDirective
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  name: string = '';
  surname: string = '';
  username: string = '';
  password: string = '';
  image: File = new File([], "empty.txt", {type: "text/plain"});
  errorMessage = '';
  isLoggedIn : any = 'false';
  photoError: string = '';
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private dbData: DbDataService) {}

  onLogin() {
    if (this.authService.login(this.username, this.password)) {
      sessionStorage.setItem('isLoggedIn', 'true'); // Salva lo stato del login
      this.router.navigate(['/fanta']);          // Naviga verso la componente protetta
    } else {
      this.errorMessage = 'Credenziali non valide!';
    }
  }


  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileType = file.type;
      const maxSize = 5 * 1024 * 1024; // 5 MB

      // Controlla che il file sia un'immagine
      if (!fileType.startsWith('image/')) {
        this.photoError = 'Il file deve essere un\'immagine.';
        input.value = ''; // Resetta il campo
        return;
      }

      // Controlla la dimensione massima
      if (file.size > maxSize) {
        this.photoError = 'Il file deve essere inferiore a 5 MB.';
        input.value = ''; // Resetta il campo
        return;
      }

      this.photoError = ''; // Nessun errore
      this.image = file;
    }
  }


  onRegistration(){
    if (this.photoError) {
      alert('Correggi gli errori prima di inviare il form.');
      return;
    }

    let fantaPlayer: FantaPlayer = {
      name: this.name,
      surname: this.surname,
      username: this.username,
      password: this.password,
      image: this.image
    }

    this.dbData.setFantaPlayer(fantaPlayer);
  }

  ngOnInit(): void {
    this.isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if( this.isLoggedIn === 'true'){
      this.router.navigate(['/fanta']);
    }
  }



}