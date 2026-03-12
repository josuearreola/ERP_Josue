import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TicketService, Ticket } from '../../services/ticket.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-group',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './group.html',
  styleUrl: './group.css',
})
export class Group implements OnInit {
  selectedGroup: any = null;
  currentUser: any = null;

  // Datos del grupo
  groupStats: any = null;
  allTickets: Ticket[] = [];
  filteredTickets: Ticket[] = []; // Para la vista Lista con filtros
  recentTickets: Ticket[] = [];

  // Vista activa
  activeTabIndex: number = 0;

  // Tickets por estado (para Kanban)
  pendienteTickets: Ticket[] = [];
  enProgresoTickets: Ticket[] = [];
  hechoTickets: Ticket[] = [];
  bloqueadoTickets: Ticket[] = [];

  // Modal de ticket
  displayTicketModal: boolean = false;
  displayCreateModal: boolean = false;
  displayEditStatusModal: boolean = false;
  displayEditModal: boolean = false;
  selectedTicket: Ticket | null = null;
  editingTicket: Ticket | null = null;

  // Filtros para la vista Lista
  filtroEstado: string = 'Todos';
  filtroPrioridad: string = 'Todos';
  filtroAsignado: string = '';
  busquedaTexto: string = '';

  // Filtros rápidos
  filtroMisTickets: boolean = false;
  filtroSinAsignar: boolean = false;
  filtroPrioridadAlta: boolean = false;

  // Ordenamiento
  ordenarPor: string = 'id';
  ordenAscendente: boolean = true;

  // Comentarios
  nuevoComentario: string = '';

  // Formulario de creación
  newTicket = {
    titulo: '',
    descripcion: '',
    estado: 'Pendiente' as 'Pendiente' | 'En Progreso' | 'Hecho' | 'Bloqueado',
    prioridad: 'Media' as 'Alta' | 'Media' | 'Baja',
    asignadoA: '',
    fechaLimite: null as Date | null
  };

  estadoOptions = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En Progreso', value: 'En Progreso' },
    { label: 'Hecho', value: 'Hecho' },
    { label: 'Bloqueado', value: 'Bloqueado' }
  ];

  prioridadOptions = [
    { label: 'Alta', value: 'Alta' },
    { label: 'Media', value: 'Media' },
    { label: 'Baja', value: 'Baja' }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly ticketService: TicketService,
    private readonly router: Router,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.selectedGroup = this.authService.getSelectedGroup();

    if (!this.selectedGroup) {
      // Si no hay grupo seleccionado, redirigir al dashboard
      this.router.navigate(['/dashboard/home']);
      return;
    }

    this.loadGroupData();
  }

  loadGroupData(): void {
    if (!this.selectedGroup) return;

    const groupId = this.selectedGroup.id;

    // Cargar estadísticas
    this.groupStats = this.ticketService.getGroupStats(groupId);

    // Cargar todos los tickets del grupo
    this.allTickets = this.ticketService.getTicketsByGroup(groupId);

    // Cargar tickets recientes
    this.recentTickets = this.ticketService.getRecentTickets(groupId, 5);

    // Organizar tickets por estado (para Kanban)
    this.pendienteTickets = this.allTickets.filter(t => t.estado === 'Pendiente');
    this.enProgresoTickets = this.allTickets.filter(t => t.estado === 'En Progreso');
    this.hechoTickets = this.allTickets.filter(t => t.estado === 'Hecho');
    this.bloqueadoTickets = this.allTickets.filter(t => t.estado === 'Bloqueado');

    // Aplicar filtros para la vista Lista
    this.aplicarFiltros();
  }

  // Aplicar filtros a la vista Lista
  aplicarFiltros(): void {
    let tickets = [...this.allTickets];

    // Filtro por estado
    if (this.filtroEstado !== 'Todos') {
      tickets = tickets.filter(t => t.estado === this.filtroEstado);
    }

    // Filtro por prioridad
    if (this.filtroPrioridad !== 'Todos') {
      tickets = tickets.filter(t => t.prioridad === this.filtroPrioridad);
    }

    // Filtro por asignado
    if (this.filtroAsignado.trim()) {
      tickets = tickets.filter(t =>
        t.asignadoA.toLowerCase().includes(this.filtroAsignado.toLowerCase())
      );
    }

    // Búsqueda por texto (título o descripción)
    if (this.busquedaTexto.trim()) {
      const busqueda = this.busquedaTexto.toLowerCase();
      tickets = tickets.filter(t =>
        t.titulo.toLowerCase().includes(busqueda) ||
        t.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar
    this.ordenarTickets(tickets);

    this.filteredTickets = tickets;
  }

  // Ordenar tickets
  ordenarTickets(tickets: Ticket[]): void {
    tickets.sort((a, b) => {
      let comparison = 0;

      switch (this.ordenarPor) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo);
          break;
        case 'estado':
          comparison = a.estado.localeCompare(b.estado);
          break;
        case 'prioridad': {
          const prioridadOrden = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
          comparison = prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
          break;
        }
        case 'fechaCreacion':
          comparison = a.fechaCreacion.getTime() - b.fechaCreacion.getTime();
          break;
        case 'fechaLimite': {
          const aFecha = a.fechaLimite?.getTime() || 0;
          const bFecha = b.fechaLimite?.getTime() || 0;
          comparison = aFecha - bFecha;
          break;
        }
      }

      return this.ordenAscendente ? comparison : -comparison;
    });
  }

  // Cambiar ordenamiento
  cambiarOrden(campo: string): void {
    if (this.ordenarPor === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenarPor = campo;
      this.ordenAscendente = true;
    }
    this.aplicarFiltros();
  }

  // Métodos para severidad de tags
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

  // Abrir modal de creación
  openCreateTicketModal(): void {
    this.newTicket = {
      titulo: '',
      descripcion: '',
      estado: 'Pendiente',
      prioridad: 'Media',
      asignadoA: this.currentUser?.username || '',
      fechaLimite: null
    };
    this.displayCreateModal = true;
  }

  // Crear ticket
  createTicket(): void {
    if (!this.newTicket.titulo.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El título es obligatorio'
      });
      return;
    }

    const currentUsername = this.currentUser?.username || 'desconocido';

    // Crear el nuevo ticket usando el servicio
    const nuevoTicket: Ticket = {
      id: this.ticketService.generateId(),
      titulo: this.newTicket.titulo,
      descripcion: this.newTicket.descripcion,
      estado: this.newTicket.estado,
      prioridad: this.newTicket.prioridad,
      asignadoA: this.newTicket.asignadoA,
      creadoPor: currentUsername,
      groupId: this.selectedGroup!.id,
      fechaCreacion: new Date(),
      fechaLimite: this.newTicket.fechaLimite || undefined,
      comentarios: [],
      historial: [{
        id: 1,
        usuario: currentUsername,
        accion: 'Creó el ticket',
        fecha: new Date()
      }]
    };

    // Guardar en el servicio (persiste en localStorage)
    this.ticketService.createTicket(nuevoTicket);

    // Recargar datos del grupo
    this.loadGroupData();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Ticket "${nuevoTicket.titulo}" creado correctamente`
    });

    this.displayCreateModal = false;
  }

  // Abrir modal de detalle
  openTicketDetail(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.displayTicketModal = true;
  }

  // Drag & Drop (placeholder)
  onDragStart(event: DragEvent, ticket: Ticket): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('ticketId', ticket.id.toString());
    }
  }

  onDrop(event: DragEvent, newStatus: 'Pendiente' | 'En Progreso' | 'Hecho' | 'Bloqueado'): void {
    event.preventDefault();
    const ticketId = event.dataTransfer?.getData('ticketId');

    if (ticketId) {
      const id = Number.parseInt(ticketId);
      const ticket = this.allTickets.find(t => t.id === id);

      if (ticket && ticket.estado !== newStatus) {
        const oldStatus = ticket.estado;

        // Actualizar en el servicio (persiste en localStorage)
        this.ticketService.updateTicket(id, { estado: newStatus });

        // Recargar datos del grupo
        this.loadGroupData();

        this.messageService.add({
          severity: 'success',
          summary: 'Estado actualizado',
          detail: `"${ticket.titulo}" movido de ${oldStatus} a ${newStatus}`
        });
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Abrir modal de editar estado
  openEditStatusModal(ticket: Ticket): void {
    this.editingTicket = { ...ticket }; // Clonar el ticket
    this.displayEditStatusModal = true;
  }

  // Actualizar estado del ticket desde el modal
  updateTicketStatus(): void {
    if (!this.editingTicket) return;

    const ticket = this.allTickets.find(t => t.id === this.editingTicket!.id);
    if (ticket) {
      const oldStatus = ticket.estado;

      // Actualizar en el servicio (persiste en localStorage)
      this.ticketService.updateTicket(this.editingTicket.id, {
        estado: this.editingTicket.estado
      });

      // Recargar datos del grupo
      this.loadGroupData();

      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `Estado de "${ticket.titulo}" cambiado de ${oldStatus} a ${this.editingTicket.estado}`
      });
    }

    this.displayEditStatusModal = false;
    this.editingTicket = null;
  }

  // Actualizar estadísticas del grupo
  updateGroupStats(): void {
    this.groupStats = {
      total: this.allTickets.length,
      pendiente: this.pendienteTickets.length,
      enProgreso: this.enProgresoTickets.length,
      hecho: this.hechoTickets.length,
      bloqueado: this.bloqueadoTickets.length
    };
  }

  // Abrir modal de edición completo
  openEditTicketModal(ticket: Ticket): void {
    this.selectedTicket = { ...ticket }; // Clonar para edición
    this.displayEditModal = true;
  }

  // Guardar cambios del ticket con historial
  saveTicketChanges(): void {
    if (!this.selectedTicket) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Verificar permisos
    const puedeEditarTodo = this.selectedTicket.creadoPor === currentUser.username;
    const puedeEditarEstado = this.selectedTicket.asignadoA === currentUser.username || puedeEditarTodo;

    if (!puedeEditarEstado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sin permisos',
        detail: 'No tienes permisos para editar este ticket'
      });
      return;
    }

    // Preparar actualizaciones
    const updates: Partial<Ticket> = {};
    const ticketOriginal = this.allTickets.find(t => t.id === this.selectedTicket!.id);

    if (!ticketOriginal) return;

    // Solo permitir cambios según permisos
    if (puedeEditarTodo) {
      if (this.selectedTicket.titulo !== ticketOriginal.titulo) updates.titulo = this.selectedTicket.titulo;
      if (this.selectedTicket.descripcion !== ticketOriginal.descripcion) updates.descripcion = this.selectedTicket.descripcion;
      if (this.selectedTicket.prioridad !== ticketOriginal.prioridad) updates.prioridad = this.selectedTicket.prioridad;
      if (this.selectedTicket.asignadoA !== ticketOriginal.asignadoA) updates.asignadoA = this.selectedTicket.asignadoA;
      if (this.selectedTicket.fechaLimite?.getTime() !== ticketOriginal.fechaLimite?.getTime()) {
        updates.fechaLimite = this.selectedTicket.fechaLimite;
      }
    }

    // Estado puede ser editado por creador o asignado
    if (this.selectedTicket.estado !== ticketOriginal.estado) {
      updates.estado = this.selectedTicket.estado;
    }

    // Actualizar con historial
    if (Object.keys(updates).length > 0) {
      this.ticketService.updateTicketWithHistory(
        this.selectedTicket.id,
        updates,
        currentUser.username || 'desconocido'
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'El ticket ha sido actualizado correctamente'
      });

      this.loadGroupData();
      this.displayEditModal = false;
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Sin cambios',
        detail: 'No se detectaron cambios en el ticket'
      });
    }
  }

  // Agregar comentario
  agregarComentario(): void {
    if (!this.selectedTicket || !this.nuevoComentario.trim()) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const exito = this.ticketService.addComentario(
      this.selectedTicket.id,
      currentUser.username || 'desconocido',
      this.nuevoComentario
    );

    if (exito) {
      this.messageService.add({
        severity: 'success',
        summary: 'Comentario agregado',
        detail: 'Tu comentario ha sido agregado al ticket'
      });

      // Actualizar el ticket seleccionado
      const ticketActualizado = this.ticketService.getTicketsByGroup(this.selectedGroup!.id)
        .find(t => t.id === this.selectedTicket!.id);

      if (ticketActualizado) {
        this.selectedTicket = ticketActualizado;
      }

      this.nuevoComentario = '';
    }
  }

  // Puede editar ticket completo (solo creador)
  puedeEditarTicket(ticket: Ticket): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? ticket.creadoPor === currentUser.username : false;
  }

  // Puede editar estado (creador o asignado)
  puedeEditarEstado(ticket: Ticket): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    return ticket.creadoPor === currentUser.username ||
      ticket.asignadoA === currentUser.username;
  }

  // Aplicar filtro rápido
  aplicarFiltroRapido(tipo: string): void {
    const currentUsername = this.currentUser?.username;

    // Resetear todos los filtros rápidos
    this.filtroMisTickets = false;
    this.filtroSinAsignar = false;
    this.filtroPrioridadAlta = false;

    // Limpiar filtros manuales
    this.filtroEstado = 'Todos';
    this.filtroPrioridad = 'Todos';
    this.filtroAsignado = '';
    this.busquedaTexto = '';

    // Aplicar el filtro seleccionado
    switch (tipo) {
      case 'mis-tickets':
        this.filtroMisTickets = true;
        this.filtroAsignado = currentUsername || '';
        break;
      case 'sin-asignar':
        this.filtroSinAsignar = true;
        this.filtroAsignado = '-';
        break;
      case 'prioridad-alta':
        this.filtroPrioridadAlta = true;
        this.filtroPrioridad = 'Alta';
        break;
    }

    this.aplicarFiltros();
  }

  // Limpiar todos los filtros
  limpiarFiltros(): void {
    this.filtroEstado = 'Todos';
    this.filtroPrioridad = 'Todos';
    this.filtroAsignado = '';
    this.busquedaTexto = '';
    this.filtroMisTickets = false;
    this.filtroSinAsignar = false;
    this.filtroPrioridadAlta = false;
    this.aplicarFiltros();
  }
}
