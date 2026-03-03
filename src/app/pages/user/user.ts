import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-user',
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, CardModule, PanelModule, ToastModule, TableModule, DialogModule, ConfirmDialogModule, InputNumberModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  user = {
    id: null as number | null,
    username: '',
    email: '',
    fullName: '',
    birthDate: '',
    phone: '',
    address: '',
    role: '',
    status: 'Activo'
  };

  users: any[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'Administrador Principal',
      birthDate: '1990-01-01',
      phone: '1234567890',
      address: 'Calle Principal 123',
      role: 'Administrador',
      status: 'Activo'
    },
    {
      id: 2,
      username: 'usuario1',
      email: 'usuario1@example.com',
      fullName: 'Usuario Ejemplo',
      birthDate: '1992-05-15',
      phone: '9876543210',
      address: 'Avenida Secundaria 456',
      role: 'Usuario',
      status: 'Activo'
    }
  ];

  roles = [
    { label: 'Administrador', value: 'Administrador' },
    { label: 'Usuario', value: 'Usuario' },
    { label: 'Supervisor', value: 'Supervisor' },
    { label: 'Gerente', value: 'Gerente' },
    { label: 'Operador', value: 'Operador' }
  ];

  displayDialog: boolean = false;
  isEditing: boolean = false;
  totalValue: string = '2';

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) { }

  onSubmit(form: NgForm) {
    if (form.valid) {
      try {
        if (this.isEditing) {
          // Actualizar usuario existente
          const index = this.users.findIndex(u => u.id === this.user.id);
          if (index !== -1) {
            this.users[index] = { ...this.user };
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario actualizado correctamente'
            });
          }
        } else {
          // Crear nuevo usuario
          const newUser = {
            ...this.user,
            id: Math.max(...this.users.map(u => u.id)) + 1
          };
          this.users.push(newUser);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario creado correctamente'
          });
        }
        this.resetForm();
        this.displayDialog = false;
        this.updateTotalValue();
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar el usuario'
        });
      }
    }
  }

  editUser(user: any) {
    this.user = { ...user };
    this.isEditing = true;
    this.displayDialog = true;
  }

  deleteUser(user: any) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este usuario?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        try {
          this.users = this.users.filter(u => u.id !== user.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario eliminado correctamente'
          });
          this.updateTotalValue();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar el usuario'
          });
        }
      }
    });
  }

  showCreateDialog() {
    this.resetForm();
    this.isEditing = false;
    this.displayDialog = true;
  }

  resetForm() {
    this.user = {
      id: null,
      username: '',
      email: '',
      fullName: '',
      birthDate: '',
      phone: '',
      address: '',
      role: '',
      status: 'Activo'
    };
  }

  updateTotalValue() {
    this.totalValue = this.users.length.toString();
  }

  ngOnInit() {
    this.updateTotalValue();
  }
}
