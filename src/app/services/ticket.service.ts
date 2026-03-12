import { Injectable } from '@angular/core';

export interface Comentario {
  id: number;
  usuario: string;
  texto: string;
  fecha: Date;
}

export interface HistorialEntry {
  id: number;
  usuario: string;
  accion: string;
  campo?: string;
  valorAnterior?: string;
  valorNuevo?: string;
  fecha: Date;
}

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'Pendiente' | 'En Progreso' | 'Hecho' | 'Bloqueado';
  prioridad: 'Alta' | 'Media' | 'Baja';
  asignadoA: string;
  creadoPor: string;
  groupId: number;
  fechaCreacion: Date;
  fechaLimite?: Date;
  comentarios: Comentario[];
  historial: HistorialEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  
  private readonly STORAGE_KEY = 'tickets';
  
  // Datos mock de tickets (solo se usan si no hay nada en localStorage)
  private readonly defaultTickets: Ticket[] = [
    {
      id: 1,
      titulo: 'Implementar login de usuarios',
      descripcion: 'Crear sistema de autenticación',
      estado: 'Hecho',
      prioridad: 'Alta',
      asignadoA: 'admin',
      creadoPor: 'admin',
      groupId: 1,
      fechaCreacion: new Date('2026-03-01'),
      fechaLimite: new Date('2026-03-10'),
      comentarios: [
        { id: 1, usuario: 'admin', texto: 'Login implementado con JWT', fecha: new Date('2026-03-09') }
      ],
      historial: [
        { id: 1, usuario: 'admin', accion: 'Creó el ticket', fecha: new Date('2026-03-01') },
        { id: 2, usuario: 'admin', accion: 'Cambió estado', campo: 'estado', valorAnterior: 'Pendiente', valorNuevo: 'En Progreso', fecha: new Date('2026-03-05') },
        { id: 3, usuario: 'admin', accion: 'Cambió estado', campo: 'estado', valorAnterior: 'En Progreso', valorNuevo: 'Hecho', fecha: new Date('2026-03-09') }
      ]
    },
    {
      id: 2,
      titulo: 'Diseñar interfaz de dashboard',
      descripcion: 'Crear mockups del dashboard principal',
      estado: 'En Progreso',
      prioridad: 'Media',
      asignadoA: 'josue',
      creadoPor: 'admin',
      groupId: 1,
      fechaCreacion: new Date('2026-03-05'),
      fechaLimite: new Date('2026-03-15'),
      comentarios: [
        { id: 1, usuario: 'josue', texto: 'Trabajando en los wireframes', fecha: new Date('2026-03-06') }
      ],
      historial: [
        { id: 1, usuario: 'admin', accion: 'Creó el ticket', fecha: new Date('2026-03-05') },
        { id: 2, usuario: 'admin', accion: 'Asignó a josue', campo: 'asignadoA', valorAnterior: '', valorNuevo: 'josue', fecha: new Date('2026-03-05') }
      ]
    },
    {
      id: 3,
      titulo: 'Configurar base de datos',
      descripcion: 'Setup PostgreSQL y esquema',
      estado: 'Pendiente',
      prioridad: 'Alta',
      asignadoA: 'test',
      creadoPor: 'admin',
      groupId: 1,
      fechaCreacion: new Date('2026-03-08'),
      fechaLimite: new Date('2026-03-20'),
      comentarios: [],
      historial: [
        { id: 1, usuario: 'admin', accion: 'Creó el ticket', fecha: new Date('2026-03-08') }
      ]
    },
    {
      id: 4,
      titulo: 'Revisar código de backend',
      descripcion: 'Code review del módulo de auth',
      estado: 'Bloqueado',
      prioridad: 'Media',
      asignadoA: 'admin',
      creadoPor: 'josue',
      groupId: 1,
      fechaCreacion: new Date('2026-03-07'),
      comentarios: [
        { id: 1, usuario: 'admin', texto: 'Esperando merge de rama develop', fecha: new Date('2026-03-08') }
      ],
      historial: [
        { id: 1, usuario: 'josue', accion: 'Creó el ticket', fecha: new Date('2026-03-07') },
        { id: 2, usuario: 'admin', accion: 'Cambió estado', campo: 'estado', valorAnterior: 'Pendiente', valorNuevo: 'Bloqueado', fecha: new Date('2026-03-08') }
      ]
    },
    {
      id: 5,
      titulo: 'Crear contenido redes sociales',
      descripcion: 'Posts para Facebook e Instagram',
      estado: 'En Progreso',
      prioridad: 'Baja',
      asignadoA: 'josue',
      creadoPor: 'josue',
      groupId: 2,
      fechaCreacion: new Date('2026-03-09'),
      fechaLimite: new Date('2026-03-12'),
      comentarios: [],
      historial: [
        { id: 1, usuario: 'josue', accion: 'Creó el ticket', fecha: new Date('2026-03-09') }
      ]
    },
    {
      id: 6,
      titulo: 'Analizar métricas de campaña',
      descripcion: 'Revisar ROI de campaña Q1',
      estado: 'Pendiente',
      prioridad: 'Media',
      asignadoA: 'test',
      creadoPor: 'test',
      groupId: 2,
      fechaCreacion: new Date('2026-03-10'),
      comentarios: [],
      historial: [
        { id: 1, usuario: 'test', accion: 'Creó el ticket', fecha: new Date('2026-03-10') }
      ]
    },
    {
      id: 7,
      titulo: 'Atender ticket de soporte #123',
      descripcion: 'Usuario reporta error en login',
      estado: 'En Progreso',
      prioridad: 'Alta',
      asignadoA: 'admin',
      creadoPor: 'admin',
      groupId: 3,
      fechaCreacion: new Date('2026-03-11'),
      comentarios: [],
      historial: [
        { id: 1, usuario: 'admin', accion: 'Creó el ticket', fecha: new Date('2026-03-11') }
      ]
    }
  ];

  private tickets: Ticket[] = [];

  constructor() {
    this.loadTickets();
  }

  /**
   * Cargar tickets desde localStorage
   */
  private loadTickets(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas de string a Date
        this.tickets = parsed.map((t: any) => ({
          ...t,
          fechaCreacion: new Date(t.fechaCreacion),
          fechaLimite: t.fechaLimite ? new Date(t.fechaLimite) : undefined,
          comentarios: (t.comentarios || []).map((c: any) => ({
            ...c,
            fecha: new Date(c.fecha)
          })),
          historial: (t.historial || []).map((h: any) => ({
            ...h,
            fecha: new Date(h.fecha)
          }))
        }));
      } else {
        // Si no hay datos, usar los mock por defecto
        this.tickets = [...this.defaultTickets];
        this.saveTickets();
      }
    } catch (e) {
      console.error('Error cargando tickets:', e);
      this.tickets = [...this.defaultTickets];
    }
  }

  /**
   * Guardar tickets en localStorage
   */
  private saveTickets(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tickets));
    } catch (e) {
      console.error('Error guardando tickets:', e);
    }
  }

  /**
   * Obtener tickets por grupo
   */
  getTicketsByGroup(groupId: number): Ticket[] {
    return this.tickets.filter(t => t.groupId === groupId);
  }

  /**
   * Obtener estadísticas de tickets por grupo
   */
  getGroupStats(groupId: number): any {
    const groupTickets = this.getTicketsByGroup(groupId);
    
    return {
      total: groupTickets.length,
      pendiente: groupTickets.filter(t => t.estado === 'Pendiente').length,
      enProgreso: groupTickets.filter(t => t.estado === 'En Progreso').length,
      hecho: groupTickets.filter(t => t.estado === 'Hecho').length,
      bloqueado: groupTickets.filter(t => t.estado === 'Bloqueado').length,
    };
  }

  /**
   * Obtener tickets recientes del grupo (últimos 5)
   */
  getRecentTickets(groupId: number, limit: number = 5): Ticket[] {
    return this.getTicketsByGroup(groupId)
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
      .slice(0, limit);
  }

  /**
   * Obtener tickets asignados a un usuario
   */
  getTicketsByUser(groupId: number, username: string): Ticket[] {
    return this.getTicketsByGroup(groupId)
      .filter(t => t.asignadoA === username);
  }

  /**
   * Obtener todos los tickets
   */
  getAllTickets(): Ticket[] {
    return [...this.tickets];
  }

  /**
   * Crear un nuevo ticket
   */
  createTicket(ticket: Ticket): Ticket {
    this.tickets.push(ticket);
    this.saveTickets();
    return ticket;
  }

  /**
   * Actualizar un ticket existente
   */
  updateTicket(ticketId: number, updates: Partial<Ticket>): Ticket | null {
    const index = this.tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      this.tickets[index] = { ...this.tickets[index], ...updates };
      this.saveTickets();
      return this.tickets[index];
    }
    return null;
  }

  /**
   * Eliminar un ticket
   */
  deleteTicket(ticketId: number): boolean {
    const index = this.tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      this.tickets.splice(index, 1);
      this.saveTickets();
      return true;
    }
    return false;
  }

  /**
   * Generar un nuevo ID único
   */
  generateId(): number {
    return this.tickets.length > 0 
      ? Math.max(...this.tickets.map(t => t.id)) + 1 
      : 1;
  }

  /**
   * Agregar un comentario a un ticket
   */
  addComentario(ticketId: number, usuario: string, texto: string): boolean {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      const nuevoComentario: Comentario = {
        id: (ticket.comentarios.length > 0 ? Math.max(...ticket.comentarios.map(c => c.id)) : 0) + 1,
        usuario,
        texto,
        fecha: new Date()
      };
      ticket.comentarios.push(nuevoComentario);
      this.saveTickets();
      return true;
    }
    return false;
  }

  /**
   * Agregar entrada al historial de un ticket
   */
  addHistorial(
    ticketId: number, 
    usuario: string, 
    accion: string, 
    campo?: string,
    valorAnterior?: string,
    valorNuevo?: string
  ): boolean {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      const nuevaEntrada: HistorialEntry = {
        id: (ticket.historial.length > 0 ? Math.max(...ticket.historial.map(h => h.id)) : 0) + 1,
        usuario,
        accion,
        campo,
        valorAnterior,
        valorNuevo,
        fecha: new Date()
      };
      ticket.historial.push(nuevaEntrada);
      this.saveTickets();
      return true;
    }
    return false;
  }

  /**
   * Actualizar ticket con registro automático en historial
   */
  updateTicketWithHistory(
    ticketId: number, 
    updates: Partial<Ticket>, 
    usuario: string
  ): Ticket | null {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    // Registrar cambios en el historial
    Object.keys(updates).forEach(key => {
      const campo = key as keyof Ticket;
      if (campo === 'comentarios' || campo === 'historial') return; // No registrar estos
      
      const valorAnterior = String(ticket[campo] || '');
      const valorNuevo = String((updates as any)[campo] || '');
      
      if (valorAnterior !== valorNuevo) {
        let accion = 'Modificó';
        let nombreCampo = campo;
        
        switch (campo) {
          case 'estado':
            accion = 'Cambió estado';
            break;
          case 'prioridad':
            accion = 'Cambió prioridad';
            break;
          case 'asignadoA':
            accion = 'Reasignó ticket';
            nombreCampo = 'asignadoA';
            break;
          case 'titulo':
            accion = 'Modificó título';
            break;
          case 'descripcion':
            accion = 'Modificó descripción';
            break;
          case 'fechaLimite':
            accion = 'Cambió fecha límite';
            break;
        }
        
        this.addHistorial(ticketId, usuario, accion, nombreCampo, valorAnterior, valorNuevo);
      }
    });

    // Actualizar el ticket
    return this.updateTicket(ticketId, updates);
  }
}
