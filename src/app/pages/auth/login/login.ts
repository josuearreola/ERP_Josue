import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, InputTextModule, ButtonModule, MessageModule, CardModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  user = {
    username: '',
    email: '',
    password: ''
  };

  private validCredentials = [
    { email: 'admin@admin.com', password: 'admin123456' },
    { email: 'josue@gmail.com', password: 'josue123' },
    { email: 'test@test.com', password: 'test123456' }
  ];

  loginError: string = '';

  constructor(private router: Router) { }

  onSubmit(form: NgForm) {
    this.loginError = '';

    if (form.valid) {
      // Validar contra credenciales hardcodeadas
      const validUser = this.validCredentials.find(
        cred => cred.email === this.user.email && cred.password === this.user.password
      );

      if (validUser) {
        console.log('Login exitoso:', this.user);
        // Redirigir al dashboard o página principal
        this.router.navigate(['/']);
      } else {
        this.loginError = 'Credenciales incorrectas. Verifique su email y contraseña.';
      }
    }
  }
}
