import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, InputTextModule, ButtonModule, MessageModule, CardModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    birthDate: '',
    address: '',
    phone: ''
  };

  registrationErrors: string[] = [];

  constructor(private router: Router) { }

  onSubmit(form: NgForm) {
    this.registrationErrors = [];

    if (form.valid && this.validateCustomFields()) {
      console.log('Registro exitoso:', this.user);
      alert('¡Registro exitoso! Ahora puede iniciar sesión.');
      this.router.navigate(['/auth/login']);
    }
  }

  private validateCustomFields(): boolean {
    let isValid = true;

    // Validar contraseña (mínimo 10 caracteres con símbolos especiales)
    if (!this.isValidPassword(this.user.password)) {
      this.registrationErrors.push('La contraseña debe tener al menos 10 caracteres e incluir símbolos especiales (!@#$%^&*)');
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (this.user.password !== this.user.confirmPassword) {
      this.registrationErrors.push('Las contraseñas no coinciden');
      isValid = false;
    }

    // Validar mayoría de edad
    if (!this.isAdult(this.user.birthDate)) {
      this.registrationErrors.push('Debe ser mayor de 18 años para registrarse');
      isValid = false;
    }

    // Validar teléfono (solo números)
    if (!this.isValidPhone(this.user.phone)) {
      this.registrationErrors.push('El número de teléfono debe contener solo números');
      isValid = false;
    }

    return isValid;
  }

  private isValidPassword(password: string): boolean {
    // Mínimo 10 caracteres y debe contener al menos un símbolo especial
    const specialChars = /[!@#$%^&*]/;
    return password.length >= 10 && specialChars.test(password);
  }

  private isAdult(birthDate: string): boolean {
    if (!birthDate) return false;

    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  }

  private isValidPhone(phone: string): boolean {
    // Solo debe contener números y tener al menos 8 dígitos
    const phoneRegex = /^\d{8,}$/;
    return phoneRegex.test(phone);
  }
}
