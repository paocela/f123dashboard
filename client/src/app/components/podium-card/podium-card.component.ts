import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule, TableModule } from '@coreui/angular';
import { TableDirective } from '@coreui/angular';

@Component({
  selector: 'app-podium-card',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TableDirective],
  templateUrl: './podium-card.component.html',
  styleUrls: ['./podium-card.component.scss']
})
export class PodiumCardComponent {
  @Input() podio: any[] = [];
  @Input() classifica: any[] = [];
  @Input() championshipTitle = '';
}