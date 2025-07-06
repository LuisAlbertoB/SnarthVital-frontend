import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service'; 
import { RegisterModalComponent } from '../../components/register/register.component';
import { User } from '../../../features/user/models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RegisterModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  showRegisterModal = false;

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (user : User) => {
        this.authService.setUser(user);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.error = 'Correo o contraseña incorrectos';
        console.error(err);
      }
    });
  }

  goToRegister(): void {
    this.showRegisterModal = true;
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }
}
