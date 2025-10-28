import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminChangePasswordComponent } from './admin-change-password.component';
import { AuthService } from 'src/app/service/auth.service';

describe('AdminChangePasswordComponent', () => {
  let component: AdminChangePasswordComponent;
  let fixture: ComponentFixture<AdminChangePasswordComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getAuthToken']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminChangePasswordComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminChangePasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect non-admin users', () => {
    mockAuthService.getCurrentUser.and.returnValue({ id: 1, username: 'test', name: 'Test', surname: 'User', isAdmin: false });
    fixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should initialize form with empty values', () => {
    expect(component.changePasswordForm.get('username')?.value).toBe('');
    expect(component.changePasswordForm.get('newPassword')?.value).toBe('');
    expect(component.changePasswordForm.get('confirmPassword')?.value).toBe('');
  });

  it('should validate password match', () => {
    const form = component.changePasswordForm;
    form.patchValue({
      username: 'testuser',
      newPassword: 'Password123',
      confirmPassword: 'Password456'
    });
    
    expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBeTruthy();
  });
});
