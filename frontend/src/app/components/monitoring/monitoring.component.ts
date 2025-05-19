import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Monitoring</h1>
      <p>Diese Komponente wird gerade entwickelt.</p>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
      }
    `,
  ],
})
export class MonitoringComponent {}
