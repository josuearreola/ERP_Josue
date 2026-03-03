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
  selector: 'app-group',
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, CardModule, PanelModule, ToastModule, TableModule, DialogModule, ConfirmDialogModule, InputNumberModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './group.html',
  styleUrl: './group.css',
})
export class Group {
  group = {
    id: null as number | null,
    nombre: '',
    categoria: '',
    nivel: null as number | null,
    autor: '',
    miembros: [] as string[],
    tickets: null as number | null
  };

  groups: any[] = [
    {
      id: 1,
      nombre: 'Desarrollo Frontend',
      categoria: 'Tecnología',
      nivel: 3,
      autor: 'Juan Pérez',
      miembros: ['Ana García', 'Carlos López', 'María González'],
      tickets: 15
    },
    {
      id: 2,
      nombre: 'Marketing Digital',
      categoria: 'Marketing',
      nivel: 2,
      autor: 'Laura Martín',
      miembros: ['Pedro Rodríguez', 'Sofia Hernández'],
      tickets: 8
    }
  ];

  categorias = [
    { label: 'Tecnología', value: 'Tecnología' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Ventas', value: 'Ventas' },
    { label: 'Recursos Humanos', value: 'Recursos Humanos' },
    { label: 'Finanzas', value: 'Finanzas' }
  ];

  miembrosText: string = '';
  displayDialog: boolean = false;
  isEditing: boolean = false;
  totalValue: string = '23';

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      // Convertir texto de miembros a array
      this.group.miembros = this.miembrosText.split(',').map(m => m.trim()).filter(m => m.length > 0);
      
      try {
        if (this.isEditing) {
          // Actualizar grupo existente
          const index = this.groups.findIndex(g => g.id === this.group.id);
          if (index !== -1) {
            this.groups[index] = { ...this.group };
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Grupo actualizado correctamente'
            });
          }
        } else {
          // Crear nuevo grupo
          const newGroup = {
            ...this.group,
            id: Math.max(...this.groups.map(g => g.id)) + 1
          };
          this.groups.push(newGroup);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Grupo creado correctamente'
          });
        }
        this.resetForm();
        this.displayDialog = false;
        this.updateTotalValue();
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar el grupo'
        });
      }
    }
  }

  editGroup(group: any) {
    this.group = { ...group };
    this.miembrosText = group.miembros ? group.miembros.join(', ') : '';
    this.isEditing = true;
    this.displayDialog = true;
  }

  deleteGroup(group: any) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este grupo?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        try {
          this.groups = this.groups.filter(g => g.id !== group.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Grupo eliminado correctamente'
          });
          this.updateTotalValue();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar el grupo'
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
    this.group = {
      id: null,
      nombre: '',
      categoria: '',
      nivel: null,
      autor: '',
      miembros: [],
      tickets: null
    };
    this.miembrosText = '';
  }

  updateTotalValue() {
    const total = this.groups.reduce((sum, group) => sum + (group.tickets || 0), 0);
    this.totalValue = total.toLocaleString();
  }

  ngOnInit() {
    this.updateTotalValue();
  }
}
