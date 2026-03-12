import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface UserPermission {
  name: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    CardModule,
    PanelModule,
    ToastModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    InputNumberModule,
    MultiSelectModule,
    SelectModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User implements OnInit {
  currentUser: any = null;
  isSuperAdmin = false;

  user = {
    id: null as number | null,
    username: '',
    email: '',
    fullName: '',
    birthDate: '',
    phone: '',
    address: '',
    role: '',
    status: 'Activo',
    permissions: [] as string[]
  };

  users: any[] = [];

  roles = [
    { label: 'SuperAdmin', value: 'SuperAdmin' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Usuario', value: 'Usuario' },
    { label: 'Supervisor', value: 'Supervisor' },
    { label: 'Gerente', value: 'Gerente' },
    { label: 'Operador', value: 'Operador' }
  ];

  availablePermissions: UserPermission[] = [
    { name: 'user:view', label: 'Ver usuarios', description: 'Puede ver la lista de usuarios' },
    { name: 'user:create', label: 'Crear usuarios', description: 'Puede crear nuevos usuarios' },
    { name: 'user:edit', label: 'Editar usuarios', description: 'Puede editar usuarios existentes' },
    { name: 'user:delete', label: 'Eliminar usuarios', description: 'Puede eliminar usuarios' },
    { name: 'group:view', label: 'Ver grupos', description: 'Puede ver grupos' },
    { name: 'group:create', label: 'Crear grupos', description: 'Puede crear nuevos grupos' },
    { name: 'group:edit', label: 'Editar grupos', description: 'Puede editar grupos' },
    { name: 'group:delete', label: 'Eliminar grupos', description: 'Puede eliminar grupos' },
    { name: 'group:add', label: 'Añadir usuarios a grupos', description: 'Puede añadir usuarios a grupos' },
    { name: 'ticket:create', label: 'Crear tickets', description: 'Puede crear tickets' },
    { name: 'ticket:edit', label: 'Editar tickets', description: 'Puede editar tickets' },
    { name: 'ticket:delete', label: 'Eliminar tickets', description: 'Puede eliminar tickets' },
    { name: 'comment:add', label: 'Añadir comentarios', description: 'Puede añadir comentarios' }
  ];

  displayDialog: boolean = false;
  displayPermissionsModal: boolean = false;
  isEditing: boolean = false;
  totalValue: string = '0';
  selectedUserForPermissions: any = null;

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Verificar si es superadmin
    if (!this.currentUser?.username || this.currentUser.username !== 'admin') {
      this.messageService.add({
        severity: 'error',
        summary: 'Acceso denegado',
        detail: 'Solo el SuperAdmin puede acceder a esta sección'
      });
      this.router.navigate(['/dashboard/home']);
      return;
    }

    this.isSuperAdmin = true;
    this.loadUsers();
  }

  loadUsers(): void {
    // Cargar usuarios desde localStorage
    const storedUsers = localStorage.getItem('system_users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    } else {
      // Usuarios por defecto
      this.users = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@admin.com',
          fullName: 'SuperAdmin Principal',
          birthDate: '1990-01-01',
          phone: '1234567890',
          address: 'Calle Principal 123',
          role: 'SuperAdmin',
          status: 'Activo',
          permissions: this.availablePermissions.map(p => p.name)
        },
        {
          id: 2,
          username: 'josue',
          email: 'josue@gmail.com',
          fullName: 'Josue García',
          birthDate: '1992-05-15',
          phone: '9876543210',
          address: 'Avenida Secundaria 456',
          role: 'Admin',
          status: 'Activo',
          permissions: ['group:view', 'group:edit', 'group:add', 'ticket:create', 'ticket:edit', 'comment:add']
        },
        {
          id: 3,
          username: 'test',
          email: 'test@test.com',
          fullName: 'Usuario Test',
          birthDate: '1995-08-20',
          phone: '5555555555',
          address: 'Calle Test 789',
          role: 'Usuario',
          status: 'Activo',
          permissions: ['group:view', 'ticket:create', 'comment:add']
        }
      ];
      this.saveUsers();
    }
    this.updateTotalValue();
  }

  saveUsers(): void {
    localStorage.setItem('system_users', JSON.stringify(this.users));
  }

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
            id: Math.max(0, ...this.users.map(u => u.id)) + 1,
            permissions: this.user.permissions || []
          };
          this.users.push(newUser);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario creado correctamente'
          });
        }
        this.saveUsers();
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
    this.user = { ...user, permissions: [...(user.permissions || [])] };
    this.isEditing = true;
    this.displayDialog = true;
  }

  deleteUser(user: any) {
    if (user.username === 'admin') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se puede eliminar al SuperAdmin principal'
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este usuario?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        try {
          this.users = this.users.filter(u => u.id !== user.id);
          this.saveUsers();
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

  openPermissionsModal(user: any) {
    this.selectedUserForPermissions = { ...user, permissions: [...(user.permissions || [])] };
    this.displayPermissionsModal = true;
  }

  savePermissions() {
    if (!this.selectedUserForPermissions) return;

    const index = this.users.findIndex(u => u.id === this.selectedUserForPermissions.id);
    if (index !== -1) {
      this.users[index].permissions = [...this.selectedUserForPermissions.permissions];
      this.saveUsers();
      this.messageService.add({
        severity: 'success',
        summary: 'Permisos actualizados',
        detail: 'Los permisos del usuario han sido actualizados'
      });
      this.displayPermissionsModal = false;
    }
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
      role: 'Usuario',
      status: 'Activo',
      permissions: []
    };
  }

  updateTotalValue() {
    this.totalValue = this.users.length.toString();
  }

  getPermissionCount(user: any): number {
    return (user.permissions || []).length;
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (role) {
      case 'SuperAdmin': return 'danger';
      case 'Admin': return 'warn';
      case 'Gerente':
      case 'Supervisor': return 'info';
      default: return 'secondary';
    }
  }

  togglePermission(event: any, permissionName: string): void {
    if (!this.selectedUserForPermissions) return;

    const checked = event.target.checked;
    if (checked) {
      if (!this.selectedUserForPermissions.permissions.includes(permissionName)) {
        this.selectedUserForPermissions.permissions.push(permissionName);
      }
    } else {
      this.selectedUserForPermissions.permissions = this.selectedUserForPermissions.permissions.filter(
        (p: string) => p !== permissionName
      );
    }
  }
}
