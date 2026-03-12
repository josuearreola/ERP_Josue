import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  email: string;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private selectedGroupId: number | null = null;

  // Usuarios válidos
  private validCredentials = [
    { email: 'admin@admin.com', password: 'admin123456', username: 'admin' },
    { email: 'josue@gmail.com', password: 'josue123', username: 'josue' },
    { email: 'test@test.com', password: 'test123456', username: 'test' }
  ];

  // Grupos por usuario (mock data)
  private userGroups: { [email: string]: any[] } = {
    'admin@admin.com': [
      { id: 1, nombre: 'Desarrollo Frontend', categoria: 'Tecnología', tickets: 15 },
      { id: 2, nombre: 'Marketing Digital', categoria: 'Marketing', tickets: 8 },
      { id: 3, nombre: 'Soporte Técnico', categoria: 'Tecnología', tickets: 5 }
    ],
    'josue@gmail.com': [
      { id: 1, nombre: 'Desarrollo Frontend', categoria: 'Tecnología', tickets: 15 },
      { id: 2, nombre: 'Marketing Digital', categoria: 'Marketing', tickets: 8 }
    ],
    'test@test.com': [
      { id: 1, nombre: 'Desarrollo Frontend', categoria: 'Tecnología', tickets: 15 }
    ]
  };

  constructor(private readonly router: Router) {
    this.loadFromStorage();
  }

  /**
   * Login de usuario
   */
  login(email: string, password: string): boolean {
    const user = this.validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (user) {
      this.currentUser = { email: user.email, username: user.username };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      return true;
    }

    return false;
  }

  /**
   * Logout
   */
  logout(): void {
    this.currentUser = null;
    this.selectedGroupId = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedGroupId');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Obtener grupos del usuario actual
   */
  getUserGroups(): any[] {
    if (!this.currentUser) {
      return [];
    }
    return this.userGroups[this.currentUser.email] || [];
  }

  /**
   * Seleccionar grupo
   */
  selectGroup(groupId: number): void {
    this.selectedGroupId = groupId;
    localStorage.setItem('selectedGroupId', groupId.toString());
  }

  /**
   * Obtener grupo seleccionado
   */
  getSelectedGroupId(): number | null {
    return this.selectedGroupId;
  }

  /**
   * Obtener grupo seleccionado completo
   */
  getSelectedGroup(): any | null {
    if (!this.selectedGroupId || !this.currentUser) {
      return null;
    }
    const groups = this.getUserGroups();
    return groups.find(g => g.id === this.selectedGroupId) || null;
  }

  /**
   * Cargar datos desde localStorage
   */
  private loadFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }

    const groupIdStr = localStorage.getItem('selectedGroupId');
    if (groupIdStr) {
      try {
        this.selectedGroupId = Number.parseInt(groupIdStr);
      } catch (e) {
        localStorage.removeItem('selectedGroupId');
      }
    }
  }
}
