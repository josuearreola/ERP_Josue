import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket } from '../../services/ticket.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-home',
  imports: [CardModule, ButtonModule, TableModule, TagModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  currentUser: any = null;
  userGroups: any[] = [];
  selectedGroup: any = null;

  // Tickets del grupo seleccionado
  groupStats: any = null;
  recentTickets: Ticket[] = [];
  myTickets: Ticket[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly ticketService: TicketService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.userGroups = this.authService.getUserGroups();

    // Cargar grupo seleccionado si existe
    const selectedGroupId = this.authService.getSelectedGroupId();
    if (selectedGroupId) {
      this.selectedGroup = this.authService.getSelectedGroup();
      this.loadGroupData(selectedGroupId);
    }
  }

  selectGroup(group: any): void {
    this.selectedGroup = group;
    this.authService.selectGroup(group.id);
    this.loadGroupData(group.id);
    // Navegar al workspace del grupo
    this.router.navigate(['/dashboard/group']);
  }

  loadGroupData(groupId: number): void {
    // Cargar estadísticas del grupo
    this.groupStats = this.ticketService.getGroupStats(groupId);

    // Cargar tickets recientes
    this.recentTickets = this.ticketService.getRecentTickets(groupId, 5);

    // Cargar tickets asignados al usuario actual
    if (this.currentUser?.username) {
      this.myTickets = this.ticketService.getTicketsByUser(groupId, this.currentUser.username);
    }
  }

  isGroupSelected(group: any): boolean {
    return this.selectedGroup?.id === group.id;
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

  onCreateTicket(): void {
    console.log('Crear nuevo ticket para grupo:', this.selectedGroup?.nombre);
    // TODO: Abrir modal de crear ticket
  }
}