import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';    
import { FormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import { GridModule, ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, ModalToggleDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  CardTextDirective,
  CardTitleDirective
} from '@coreui/angular';
import { LeaderboardComponent } from "../../../components/leaderboard/leaderboard.component";
import { DbDataService } from '../../../app/service/db-data.service';
import { FantaPlayer } from '../../model/fanta';
import { User } from '../../../app/model/user';
import { cilWarning } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

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
    ModalToggleDirective,
    IconDirective,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    CardTextDirective,
    CardTitleDirective
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
  usernameError: string = '';
  
  public warningIcon: string[] = cilWarning;

  public modalVisible = true; // modal is used to load avatars for fanta (via google form)

  
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private dbData: DbDataService) {}
  
  users: User[] = this.dbData.getUsers();

  
  onLogin() {
    if (this.authService.login(this.username, this.password)) {
      sessionStorage.setItem('isLoggedIn', 'true'); // Salva lo stato del login
      this.router.navigate(['/fanta']);          // Naviga verso la componente protetta
    } else {
      window.alert("Credenziali non valide!, Ritenta e sarai più fortunarto")
    }
  }


  // onFileChange(event: Event): void {
  //   const input = event.target as HTMLInputElement;

  //   if (input.files && input.files[0]) {
  //     const file = input.files[0];
  //     const fileType = file.type;
  //     const maxSize = 5 * 1024 * 1024; // 5 MB

  //     // Controlla che il file sia un'immagine
  //     if (!fileType.startsWith('image/')) {
  //       this.photoError = 'Il file deve essere un\'immagine.';
  //       input.value = ''; // Resetta il campo
  //       return;
  //     }

  //     // Controlla la dimensione massima
  //     if (file.size > maxSize) {
  //       this.photoError = 'Il file deve essere inferiore a 5 MB.';
  //       input.value = ''; // Resetta il campo
  //       return;
  //     }

  //     this.photoError = ''; // Nessun errore
  //     this.image = file;
  //   }
  // }


  onRegistration(){
    if (!this.formIsValid(this.username)) {
      this.usernameError = 'Username già esistente';
      return;
    }

    if (this.photoError) {
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

    window.alert("Registrazione effettuata con successo, ora puoi fare il login con i tuoi dati, Buon Divertimento")
    //ritardo aggiunto perchè se no non vengono scritti in tempo i dati nel db
    setTimeout(() => {
      window.location.reload();
    }, 500); 
  }

  formIsValid(username: string): boolean {
    return !this.users.some(user => user.username == username);
  }

  toggleModal() {
    this.modalVisible = !this.modalVisible;
  }


  ngOnInit(): void {
    this.isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if( this.isLoggedIn === 'true'){
      this.router.navigate(['/fanta']);
    }
  }



}