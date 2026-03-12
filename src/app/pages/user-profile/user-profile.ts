import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket } from '../../services/ticket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule, ButtonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  currentUser: any = null;
  assignedTickets: Ticket[] = [];
  stats = {
    total: 0,
    pendiente: 0,
    enProgreso: 0,
    hecho: 0,
    bloqueado: 0
  };

  constructor(
    private readonly authService: AuthService,
    private readonly ticketService: TicketService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadUserTickets();
  }

  loadUserTickets(): void {
    if (!this.currentUser) return;

    // Obtener todos los tickets del usuario (de todos los grupos)
    const allTickets = this.ticketService.getTicketsByGroup(0); // Obtener todos los tickets
    const allGroupTickets: Ticket[] = [];
    
    // Recorrer todos los grupos del usuario
    const userGroups = JSON.parse(localStorage.getItem('userGroups') || '{}');
    const groups = userGroups[this.currentUser.email] || [];
    
    groups.forEach((group: any) => {
      const groupTickets = this.ticketService.getTicketsByGroup(group.id);
      allGroupTickets.push(...groupTickets);
    });

    this.assignedTickets = allGroupTickets.filter(
      (ticket: Ticket) => ticket.asignadoA === this.currentUser.username
    );

    // Calcular estadísticas
    this.stats.total = this.assignedTickets.length;
    this.stats.pendiente = this.assignedTickets.filter(t => t.estado === 'Pendiente').length;
    this.stats.enProgreso = this.assignedTickets.filter(t => t.estado === 'En Progreso').length;
    this.stats.hecho = this.assignedTickets.filter(t => t.estado === 'Hecho').length;
    this.stats.bloqueado = this.assignedTickets.filter(t => t.estado === 'Bloqueado').length;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Hecho': return 'success';
      case 'En Progreso': return 'info';
      case 'Pendiente': return 'warn';
      case 'Bloqueado': return 'danger';
      default: return 'secondary';
    }
  }

  getPrioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (priority) {
      case 'Alta': return 'danger';
      case 'Media': return 'warn';
      case 'Baja': return 'info';
      default: return 'secondary';
    }
  }

  navigateToGroup(groupId: number): void {
    // Buscar el grupo en los grupos del usuario
    const allUserGroups = JSON.parse(localStorage.getItem('userGroups') || '{}');
    const userGroups = allUserGroups[this.currentUser.email] || [];
    const group = userGroups.find((g: any) => g.id === groupId);
    
    if (group) {
      this.authService.selectGroup(group);
      this.router.navigate(['/dashboard/group']);
    }
  }
}
