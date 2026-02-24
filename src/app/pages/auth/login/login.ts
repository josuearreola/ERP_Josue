import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Form submitted:', this.user);
    }
  }
}
