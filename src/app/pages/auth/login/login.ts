import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, InputTextModule, ButtonModule, MessageModule, CardModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  user = {
    email: '',
    password: ''
  };

  loginError: string = '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) { }

  onSubmit(form: NgForm) {
    this.loginError = '';

    if (form.valid) {
      const success = this.authService.login(this.user.email, this.user.password);

      if (success) {
        console.log('Login exitoso');
        this.router.navigate(['/dashboard/home']);
      } else {
        this.loginError = 'Credenciales incorrectas. Verifique su email y contraseña.';
      }
    }
  }
}
