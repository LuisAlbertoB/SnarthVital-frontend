import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service'; 
import { RegisterModalComponent } from '../../components/register/register.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RegisterModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // <-- CORREGIDO
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  showRegisterModal = false;

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/home']),
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
