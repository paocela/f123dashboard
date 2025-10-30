import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule, TableModule } from '@coreui/angular';
// Import CoreUI Card
import { PodiumCardComponent } from '../../components/podium-card/podium-card.component';
import { GridModule } from '@coreui/angular';
import { DbDataService } from '../../service/db-data.service';
import { DriverData } from '@genezio-sdk/f123dashboard';

@Component({
  selector: 'app-albo-d-oro',
  standalone: true,
  imports: [CommonModule, PodiumCardComponent, GridModule, CardModule, TableModule],
  templateUrl: './albo-d-oro.component.html',
  styleUrls: ['./albo-d-oro.component.scss']
})
export class AlboDOroComponent implements OnInit {
  private dbDataService = inject(DbDataService);

  podio: { posizione: number; nome: string; img: string; colore: string; punti: string; }[] = [];
  classifica: { posizione: string; nome: string; punti: string; }[] = [];

  podioFanta: { posizione: number; nome: string; punti: string; img: string; colore: string; }[] = [];
  classificaFanta: { posizione: string; nome: string; punti: string }[] = [];

  ngOnInit(): void {
    this.loadAlboDoro();
  }

  async loadAlboDoro(): Promise<void> {
    try {
      const drivers: DriverData[] = await this.dbDataService.getDriversBySeason(1);
      
      // Sort drivers by total_points descending
      const sortedDrivers = drivers.sort((a, b) => +b.total_points - +a.total_points);

      this.podioFanta = [
          { posizione: 2, nome: "Chichi", punti: "481", img: `/assets/images/avatars_fanta/chichi.jpg`, colore: '#008080' },
          { posizione: 1, nome: "ProprioGiotto", punti: "499", img: `/assets/images/avatars_fanta/7.png`, colore: '#f699cd ' },
          { posizione: 3, nome: "Fambler", punti: "480", img: `/assets/images/avatars_fanta/2.png`, colore: '#ff0000ff' }
        ];

      this.classificaFanta = [
          { posizione: "#4", nome: "Shika", punti: "472" },
          { posizione: "#5", nome: "Matte", punti: "432" },
          { posizione: "#6", nome: "Ali", punti: "414" },
          { posizione: "#7", nome: "Sara", punti: "386" },
          { posizione: "#8", nome: "BoxBoxBunny", punti: "381" },
          { posizione: "#9", nome: "Omix", punti: "347" },
          { posizione: "#10", nome: "GommaRosa", punti: "304" }
        ];



      // Podio setup
      if (sortedDrivers.length >= 3) {
        const podioDrivers = sortedDrivers.slice(0, 3);
        const first = podioDrivers[0];
        const second = podioDrivers[1];
        const third = podioDrivers[2];

        this.podio = [
          { posizione: 2, nome: second.driver_username, img: `/assets/images/avatars/${second.driver_username}.png`, colore: second.driver_color, punti: second.total_points.toString() },
          { posizione: 1, nome: first.driver_username, img: `/assets/images/avatars/${first.driver_username}.png`, colore: first.driver_color, punti: first.total_points.toString() },
          { posizione: 3, nome: third.driver_username, img: `/assets/images/avatars/${third.driver_username}.png`, colore: third.driver_color, punti: third.total_points.toString() }
        ];
      } else if (sortedDrivers.length > 0) 
        // Handle cases with fewer than 3 drivers for the podium
        {this.podio = sortedDrivers.map((driver, index) => ({
            posizione: index + 1,
            nome: driver.driver_username,
            img: `/assets/images/avatars/${driver.driver_username}.png`,
            colore: driver.driver_color,
            punti: driver.total_points.toString()
        }));}
      

      // Classifica setup
      if (sortedDrivers.length > 3) 
        {this.classifica = sortedDrivers.slice(3).map((driver, index) => ({
          posizione: `#${index + 4}`,
          nome: driver.driver_username,
          punti: driver.total_points.toString()
        }));}
      
    } catch (error) {
      console.error('Error loading albo d\'oro:', error);
    }
  }
}