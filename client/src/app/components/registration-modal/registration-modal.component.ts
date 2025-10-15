import { Component, EventEmitter, Output, ViewChild, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  FormModule,
  GridModule,
  ModalBodyComponent,
  ModalComponent,
  ModalHeaderComponent,
  SpinnerComponent,
  AlertComponent
} from '@coreui/angular';
import { AuthService } from '../../service/auth.service';
import { User } from '@genezio-sdk/f123dashboard';

@Component({
  selector: 'app-registration-modal',
  templateUrl: './registration-modal.component.html',
  styleUrls: ['./registration-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    ButtonDirective,
    GridModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    SpinnerComponent,
    AlertComponent
  ],
  standalone: true
})
export class RegistrationModalComponent implements OnDestroy {
  // Modal mode - 'register' for new users, 'update' for editing profile
  @Input() mode: 'register' | 'update' = 'register';
  @Input() userData: User | null = null;
  
  // Flag to track if we're completing email for existing user
  public isEmailCompletion: boolean = false;

  // Registration form fields
  name: string = '';
  surname: string = '';
  regUsername: string = '';
  regPassword: string = '';
  confirmPassword: string = '';
  email: string = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string = '';
  // Store the processed base64 data
  processedImageBase64: string = '';

  // State management
  isLoading: boolean = false;
  singInErrorMessage: string = '';
  successMessage: string = '';

  @ViewChild('verticallyCenteredModal') public modal!: ModalComponent;

  @Output() registrationSuccess = new EventEmitter<void>();
  @Output() updateSuccess = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  ngOnDestroy() {
    // Clean up any preview URL and processed data
    this.imagePreviewUrl = '';
    this.processedImageBase64 = '';
  }

  // New method to open modal in update mode
  openForUpdate(user: User) {
    this.mode = 'update';
    this.userData = user;
    this.isEmailCompletion = false;
    this.singInErrorMessage = '';
    this.successMessage = '';
    this.populateUserData(user);
    this.modal.visible = true;
  }

  // New method to open modal in register mode
  openForRegistration() {
    this.mode = 'register';
    this.userData = null;
    this.isEmailCompletion = false;
    this.clearForm();
    this.singInErrorMessage = '';
    this.successMessage = '';
    this.modal.visible = true;
  }

  // New method to open modal for email completion
  openForEmailCompletion(user: User) {
    this.mode = 'update';
    this.userData = user;
    this.isEmailCompletion = true;
    this.singInErrorMessage = '';
    this.successMessage = '';
    this.populateUserDataForEmailCompletion(user);
    this.modal.visible = true;
  }

  private populateUserData(user: User) {
    this.name = user.name || '';
    this.surname = user.surname || '';
    this.regUsername = user.username || '';
    this.email = user.mail || '';
    
    // Set current user image if available
    if (user.image) {
      this.imagePreviewUrl = `data:image/jpeg;base64,${user.image}`;
      this.processedImageBase64 = user.image;
    } else {
      this.imagePreviewUrl = '';
      this.processedImageBase64 = '';
    }
    
    // Clear password fields for update mode
    this.regPassword = '';
    this.confirmPassword = '';
    this.selectedFile = null;
  }

  private populateUserDataForEmailCompletion(user: User) {
    this.name = user.name || '';
    this.surname = user.surname || '';
    this.regUsername = user.username || '';
    this.email = ''; // Force email to be empty so user must fill it
    
    // Set current user image if available
    if (user.image) {
      this.imagePreviewUrl = `data:image/jpeg;base64,${user.image}`;
      this.processedImageBase64 = user.image;
    } else {
      this.imagePreviewUrl = '';
      this.processedImageBase64 = '';
    }
    
    // Clear password fields for update mode
    this.regPassword = '';
    this.confirmPassword = '';
    this.selectedFile = null;
  }

  private clearForm() {
    this.name = '';
    this.surname = '';
    this.regUsername = '';
    this.regPassword = '';
    this.confirmPassword = '';
    this.email = '';
    this.selectedFile = null;
    this.imagePreviewUrl = '';
    this.processedImageBase64 = '';
    this.singInErrorMessage = '';
    this.successMessage = '';
    this.isEmailCompletion = false;
  }


  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type - only JPEG allowed
      const allowedTypes = ['image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        this.singInErrorMessage = 'Selezionare solo file immagine JPEG';
        this.selectedFile = null;
        // Reset the input
        input.value = '';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.singInErrorMessage = 'L\'immagine deve essere inferiore a 5MB';
        this.selectedFile = null;
        // Reset the input
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.singInErrorMessage = ''; // Clear any previous error
      
      try {
        // Convert and resize the image, then create preview from the processed result
        const processedImageBase64 = await this.convertFileToBase64(file);
        
        // Store the processed base64 data for later use
        this.processedImageBase64 = processedImageBase64;
        
        // Create preview URL from the processed base64 data
        this.imagePreviewUrl = `data:image/jpeg;base64,${processedImageBase64}`;
        
        console.log("File selezionato e processato:", this.selectedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        this.singInErrorMessage = 'Errore durante l\'elaborazione dell\'immagine';
        this.selectedFile = null;
        // Reset the input
        input.value = '';
      }
    }
  }

  removeSelectedFile() {
    // Clean up the previous preview URL - no need to revoke since it's now a data URL
    this.imagePreviewUrl = '';
    this.processedImageBase64 = '';
    
    this.selectedFile = null;
    // Reset the file input
    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  async onRegistration() {
    if (this.mode === 'register') {
      await this.handleRegistration();
    } else {
      await this.handleUpdate();
    }
  }

  private async handleRegistration() {
    if (!this.validateRegistrationForm()) {
      return;
    }

    this.isLoading = true;
    this.singInErrorMessage = '';

    try {
      // Use the already processed base64 data if available
      const imageData: string = this.processedImageBase64;

      const response = await this.authService.register({
        username: this.regUsername,
        name: this.name,
        surname: this.surname,
        password: this.regPassword,
        mail: this.email,
        image: imageData
      });

      if (response.success) {
        this.successMessage = 'Registration successful!';
        this.registrationSuccess.emit();
        setTimeout(() => this.modal.visible = false, 2000);
      } else {
        this.singInErrorMessage = response.message || 'Registration failed. Please try again.';
      }
    } catch (error) {
      this.singInErrorMessage = 'An error occurred during registration. Please try again.';
      console.error('Registration error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleUpdate() {
    if (!this.validateUpdateForm()) {
      return;
    }

    this.isLoading = true;
    this.singInErrorMessage = '';

    try {
      // Prepare update data - only include changed fields
      const updateData: any = {};
      
      if (this.userData) {
        // Only include fields that have changed
        if (this.name !== this.userData.name) {
          updateData.name = this.name;
        }
        if (this.surname !== this.userData.surname) {
          updateData.surname = this.surname;
        }
        if (this.email !== this.userData.mail) {
          updateData.mail = this.email;
        }
        // Include image if a new one was selected or if existing image was removed
        if (this.selectedFile || (this.processedImageBase64 !== this.userData.image)) {
          updateData.image = this.processedImageBase64;
        }
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        this.singInErrorMessage = 'Nessuna modifica da salvare';
        this.isLoading = false;
        return;
      }

      const response = await this.authService.updateUserInfo(updateData);

      if (response.success) {
        this.successMessage = 'Profilo aggiornato con successo!';
        this.updateSuccess.emit();
        setTimeout(() => this.modal.visible = false, 2000);
      } else {
        this.singInErrorMessage = response.message || 'Aggiornamento fallito. Riprova.';
      }
    } catch (error) {
      this.singInErrorMessage = 'Si è verificato un errore durante l\'aggiornamento. Riprova.';
      console.error('Update error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create an image element to resize the image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Unable to get canvas context'));
        return;
      }

      img.onload = () => {
        // Set canvas size to 80x80px
        canvas.width = 80;
        canvas.height = 80;

        // Calculate crop dimensions to maintain aspect ratio
        const { sourceX, sourceY, sourceWidth, sourceHeight } = this.calculateCropDimensions(img.width, img.height);

        // Draw the cropped image on the canvas
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle (crop area)
          0, 0, 80, 80                                  // Destination rectangle (canvas)
        );

        // Convert canvas to base64
        try {
          const base64String = canvas.toDataURL('image/jpeg', 0.8); // 0.8 quality for JPEG compression
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        } catch (error) {
          reject(new Error('Failed to convert resized image to base64'));
        } finally {
          // Clean up object URL
          URL.revokeObjectURL(objectUrl);
        }
      };

      img.onerror = () => reject(new Error('Error loading image for resizing'));

      // Create object URL for the file and set it as image source
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  }

  private calculateCropDimensions(imageWidth: number, imageHeight: number) {
    // Calculate the size of the square crop area (use the smaller dimension)
    const cropSize = Math.min(imageWidth, imageHeight);
    
    // Calculate the position to center the crop
    const sourceX = (imageWidth - cropSize) / 2;
    const sourceY = (imageHeight - cropSize) / 2;
    
    return {
      sourceX,
      sourceY,
      sourceWidth: cropSize,
      sourceHeight: cropSize
    };
  }

  private validateRegistrationForm(): boolean {
    this.singInErrorMessage = '';

    if (!this.name || !this.surname || !this.regUsername || !this.regPassword || !this.email) {
      this.singInErrorMessage = 'Tutti i campi sono obbligatori';
      return false;
    }

    if (this.regUsername.length < 3) {
      this.singInErrorMessage = 'L\'username deve contenere almeno 3 caratteri';
      return false;
    }

    if (this.regPassword.length < 8) {
      this.singInErrorMessage = 'La password deve contenere almeno 8 caratteri';
      return false;
    }

    if (this.regPassword !== this.confirmPassword) {
      this.singInErrorMessage = 'Le password non corrispondono';
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.singInErrorMessage = 'Inserire un indirizzo email valido';
      return false;
    }

    // Password strength validation
    if (!this.isPasswordStrong(this.regPassword)) {
      this.singInErrorMessage = 'La password deve contenere almeno una lettera maiuscola, una lettera minuscola, un numero e un carattere speciale';
      return false;
    }

    return true;
  }

  private validateUpdateForm(): boolean {
    this.singInErrorMessage = '';

    // In email completion mode, only email is required
    if (this.isEmailCompletion) {
      if (!this.email || this.email.trim() === '') {
        this.singInErrorMessage = 'Email è obbligatoria per completare il profilo';
        return false;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.singInErrorMessage = 'Inserire un indirizzo email valido';
        return false;
      }

      return true;
    }

    // In normal update mode, all fields are required
    if (!this.name || !this.surname || !this.email) {
      this.singInErrorMessage = 'Nome, cognome ed email sono obbligatori';
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.singInErrorMessage = 'Inserire un indirizzo email valido';
      return false;
    }

    return true;
  }

  private isPasswordStrong(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  getModalTitle(): string {
    if (this.mode === 'register') {
      return 'Crea il tuo account';
    } else if (this.isEmailCompletion) {
      return 'Completa il tuo profilo';
    } else {
      return 'Modifica il tuo profilo';
    }
  }
}