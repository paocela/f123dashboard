import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { PasswordChangeModalComponent } from './password-change-modal.component';

describe('PasswordChangeModalComponent', () => {
  let component: PasswordChangeModalComponent;
  let fixture: ComponentFixture<PasswordChangeModalComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['changePassword']);

    await TestBed.configureTestingModule({
      imports: [
        PasswordChangeModalComponent,
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordChangeModalComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form correctly', () => {
    // Test empty fields
    expect(component['validateForm']()).toBeFalsy();
    expect(component.errorMessage).toContain('La password attuale è obbligatoria');

    // Test password too short
    component.currentPassword = 'current123';
    component.newPassword = 'short';
    component.confirmPassword = 'short';
    expect(component['validateForm']()).toBeFalsy();
    expect(component.errorMessage).toContain('La nuova password deve essere di almeno 8 caratteri');

    // Test password not strong enough
    component.newPassword = 'simple123';
    component.confirmPassword = 'simple123';
    expect(component['validateForm']()).toBeFalsy();
    expect(component.errorMessage).toContain('La password deve contenere almeno una lettera maiuscola, una lettera minuscola, un numero e un carattere speciale');

    // Test password mismatch
    component.newPassword = 'Strong123!';
    component.confirmPassword = 'Different123!';
    expect(component['validateForm']()).toBeFalsy();
    expect(component.errorMessage).toContain('Le password non corrispondono');

    // Test same as current password
    component.currentPassword = 'Strong123!';
    component.newPassword = 'Strong123!';
    component.confirmPassword = 'Strong123!';
    expect(component['validateForm']()).toBeFalsy();
    expect(component.errorMessage).toContain('La nuova password deve essere diversa da quella attuale');

    // Test valid form
    component.currentPassword = 'OldPassword123!';
    component.newPassword = 'NewPassword123!';
    component.confirmPassword = 'NewPassword123!';
    expect(component['validateForm']()).toBeTruthy();
  });

  it('should check password strength correctly', () => {
    expect(component['isPasswordStrong']('weak')).toBeFalsy();
    expect(component['isPasswordStrong']('Weak123')).toBeFalsy(); // missing special char
    expect(component['isPasswordStrong']('weak123!')).toBeFalsy(); // missing uppercase
    expect(component['isPasswordStrong']('WEAK123!')).toBeFalsy(); // missing lowercase
    expect(component['isPasswordStrong']('WeakPass!')).toBeFalsy(); // missing number
    expect(component['isPasswordStrong']('Strong123!')).toBeTruthy(); // valid
  });

  it('should reset form on close', () => {
    component.currentPassword = 'test';
    component.newPassword = 'test123';
    component.confirmPassword = 'test123';
    component.errorMessage = 'Error';

    component['resetForm']();

    expect(component.currentPassword).toBe('');
    expect(component.newPassword).toBe('');
    expect(component.confirmPassword).toBe('');
    expect(component.errorMessage).toBe('');
  });
});
