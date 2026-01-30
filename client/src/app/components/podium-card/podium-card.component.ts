import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule, TableModule } from '@coreui/angular';
import { TableDirective } from '@coreui/angular';

interface PodiumEntry {
  posizione: number;
  nome: string;
  img: string;
  colore: string;
  punti: string;
}

interface ClassificaEntry {
  posizione: string;
  nome: string;
  punti: string;
}

@Component({
  selector: 'app-podium-card',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TableDirective],
  templateUrl: './podium-card.component.html',
  styleUrls: ['./podium-card.component.scss']
})
export class PodiumCardComponent {
  @Input() podio: PodiumEntry[] = [];
  @Input() classifica: ClassificaEntry[] = [];
  @Input() championshipTitle = '';
}