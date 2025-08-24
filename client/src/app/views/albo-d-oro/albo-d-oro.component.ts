import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule, TableModule } from '@coreui/angular';
// Import CoreUI Card
import { PodiumCardComponent } from '../../components/podium-card/podium-card.component';
import { GridModule } from '@coreui/angular';
import { ChampionshipTrendComponent } from '../../components/championship-trend/championship-trend.component';


@Component({
  selector: 'app-albo-d-oro',
  standalone: true,
  imports: [CommonModule, PodiumCardComponent, GridModule, ChampionshipTrendComponent,CardModule, TableModule],
  templateUrl: './albo-d-oro.component.html',
  styleUrls: ['./albo-d-oro.component.scss']
})
export class AlboDOroComponent {
  podio = [
    { posizione: 2, nome: 'redmamba_99_', img: '/assets/images/avatars/redmamba_99_.png', colore: '#8a2be2' },
    { posizione: 1, nome: 'Lil Mvrck', img: '/assets/images/avatars/Lil Mvrck.png', colore: '#6495ed' },
    { posizione: 3, nome: 'GiannisCorbe', img: '/assets/images/avatars/GiannisCorbe.png', colore: '#ffa500' }
  ];

  classifica = [
    { posizione: "#4", nome: 'HeavyButt' },
    { posizione: "#5", nome: 'FASTman' },
    { posizione: "#6", nome: 'Marcogang96' }
  ];
}