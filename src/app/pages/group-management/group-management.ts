 import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface GroupUser {
  email: string;
  username: string;
  role: string;
  permissions: string[];
}

interface GroupConfig {
  id: number;
  nombre: string;
  categoria: string;
  usuarios: GroupUser[];
}

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './group-management.html',
  styleUrl: './group-management.css'
})
export class GroupManagement implements OnInit {
  currentUser: any = null;
  selectedGroup: any = null;
  groupConfig: GroupConfig | null = null;
  
  displayAddUserModal = false;
  displayEditGroupModal = false;
  
  newUserEmail = '';
  editedGroupName = '';
  editedGroupCategory = '';

  // Permisos disponibles
  availablePermissions = [
    'group:view',
    'group:edit',
    'group:add',
    'group:delete',
    'ticket:create',
    'ticket:edit',
    'ticket:delete',
    'comment:add'
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.selectedGroup = this.authService.getSelectedGroup();

    if (!this.currentUser || !this.selectedGroup) {
      this.router.navigate(['/dashboard/home']);
      return;
    }

    this.loadGroupConfig();
  }

  loadGroupConfig(): void {
    if (!this.selectedGroup) return;

    // Simular carga de configuración del grupo desde localStorage
    const storedConfig = localStorage.getItem(`group_config_${this.selectedGroup.id}`);
    
    if (storedConfig) {
      this.groupConfig = JSON.parse(storedConfig);
    } else {
      // Configuración por defecto
      this.groupConfig = {
        id: this.selectedGroup.id,
        nombre: this.selectedGroup.nombre,
        categoria: this.selectedGroup.categoria,
        usuarios: [
          {
            email: this.currentUser.email,
            username: this.currentUser.username,
            role: 'Admin',
            permissions: ['group:view', 'group:edit', 'group:add', 'group:delete', 'ticket:create', 'ticket:edit', 'ticket:delete', 'comment:add']
          }
        ]
      };
      this.saveGroupConfig();
    }

    if (this.groupConfig) {
      this.editedGroupName = this.groupConfig.nombre;
      this.editedGroupCategory = this.groupConfig.categoria;
    }
  }

  saveGroupConfig(): void {
    if (!this.groupConfig) return;
    localStorage.setItem(`group_config_${this.groupConfig.id}`, JSON.stringify(this.groupConfig));
  }

  hasPermission(permission: string): boolean {
    if (!this.groupConfig) return false;
    
    const currentUserInGroup = this.groupConfig.usuarios.find(
      u => u.email === this.currentUser?.email
    );

    return currentUserInGroup?.permissions.includes(permission) || false;
  }

  openAddUserModal(): void {
    if (!this.hasPermission('group:add')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para añadir usuarios al grupo'
      });
      return;
    }
    this.newUserEmail = '';
    this.displayAddUserModal = true;
  }

  addUserToGroup(): void {
    if (!this.groupConfig || !this.newUserEmail.trim()) return;

    // Verificar si el usuario ya está en el grupo
    const userExists = this.groupConfig.usuarios.some(
      u => u.email === this.newUserEmail
    );

    if (userExists) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Usuario existente',
        detail: 'Este usuario ya pertenece al grupo'
      });
      return;
    }

    // Simular búsqueda del usuario (en un caso real, consultaríamos un backend)
    const username = this.newUserEmail.split('@')[0];

    this.groupConfig.usuarios.push({
      email: this.newUserEmail,
      username: username,
      role: 'Member',
      permissions: ['group:view', 'ticket:create', 'comment:add']
    });

    this.saveGroupConfig();

    this.messageService.add({
      severity: 'success',
      summary: 'Usuario añadido',
      detail: `${this.newUserEmail} ha sido añadido al grupo`
    });

    this.displayAddUserModal = false;
  }

  removeUserFromGroup(userEmail: string): void {
    if (!this.groupConfig) return;

    if (!this.hasPermission('group:delete')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para eliminar usuarios del grupo'
      });
      return;
    }

    // No permitir eliminar al último admin
    const admins = this.groupConfig.usuarios.filter(u => u.role === 'Admin');
    const userToRemove = this.groupConfig.usuarios.find(u => u.email === userEmail);

    if (admins.length === 1 && userToRemove?.role === 'Admin') {
      this.messageService.add({
        severity: 'error',
        summary: 'No se puede eliminar',
        detail: 'No puedes eliminar al último administrador del grupo'
      });
      return;
    }

    this.groupConfig.usuarios = this.groupConfig.usuarios.filter(
      u => u.email !== userEmail
    );

    this.saveGroupConfig();

    this.messageService.add({
      severity: 'success',
      summary: 'Usuario eliminado',
      detail: 'El usuario ha sido eliminado del grupo'
    });
  }

  openEditGroupModal(): void {
    if (!this.hasPermission('group:edit')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para editar la configuración del grupo'
      });
      return;
    }
    this.displayEditGroupModal = true;
  }

  saveGroupSettings(): void {
    if (!this.groupConfig) return;

    this.groupConfig.nombre = this.editedGroupName;
    this.groupConfig.categoria = this.editedGroupCategory;

    // Actualizar también el objeto del grupo seleccionado
    this.selectedGroup.nombre = this.editedGroupName;
    this.selectedGroup.categoria = this.editedGroupCategory;

    this.saveGroupConfig();

    this.messageService.add({
      severity: 'success',
      summary: 'Configuración guardada',
      detail: 'Los cambios han sido guardados correctamente'
    });

    this.displayEditGroupModal = false;
  }

  getPermissionLabel(permission: string): string {
    const labels: { [key: string]: string } = {
      'group:view': 'Ver grupo',
      'group:edit': 'Editar grupo',
      'group:add': 'Añadir usuarios',
      'group:delete': 'Eliminar usuarios',
      'ticket:create': 'Crear tickets',
      'ticket:edit': 'Editar tickets',
      'ticket:delete': 'Eliminar tickets',
      'comment:add': 'Añadir comentarios'
    };
    return labels[permission] || permission;
  }
}
