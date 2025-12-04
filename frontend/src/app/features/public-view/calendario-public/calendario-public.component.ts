import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendario-public',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 3rem; text-align: center;">
      <h1>Calendario de Partidos</h1>
      <p>Esta sección estará disponible próximamente.</p>
    </div>
  `
})
export class CalendarioPublicComponent {}