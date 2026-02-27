import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-user',
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, CardModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  user = {
    username: '',
    email: '',
    fullName: '',
    birthDate: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  };

  formErrors: string[] = [];

  onSubmit(form: NgForm) {
    this.formErrors = [];
    
    if (form.valid) {
      console.log('Usuario guardado:', this.user);
      // Aquí se implementaría la lógica para guardar el usuario
    }
  }
}
