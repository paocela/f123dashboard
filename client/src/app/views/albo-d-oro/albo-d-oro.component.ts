import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule, TableModule } from '@coreui/angular';
// Import CoreUI Card
import { PodiumCardComponent } from '../../components/podium-card/podium-card.component';
import { GridModule } from '@coreui/angular';
import { DbDataService } from '../../service/db-data.service';
import { AllDriverData } from '../../model/driver';

@Component({
  selector: 'app-albo-d-oro',
  standalone: true,
  imports: [CommonModule, PodiumCardComponent, GridModule, CardModule, TableModule],
  templateUrl: './albo-d-oro.component.html',
  styleUrls: ['./albo-d-oro.component.scss']
})
export class AlboDOroComponent implements OnInit {
  podio: { posizione: number; nome: string; img: string; colore: string; }[] = [];
  classifica: { posizione: string; nome: string; }[] = [];

  constructor(private dbDataService: DbDataService) {}

  ngOnInit(): void {
    this.loadAlboDoro();
  }

  private getColor(driverColor: string): string {
    const colorMap: { [key: string]: string } = {
      'primary': '#8a2be2',
      'info': '#6495ed',
      'warning': '#ffa500',
      'secondary': '#6c757d',
      'success': '#28a745',
      'danger': '#dc3545'
    };
    return colorMap[driverColor] || '#000000'; // Fallback to black
  }

  async loadAlboDoro(): Promise<void> {
    try {
      const drivers: AllDriverData[] = await this.dbDataService.getDriversBySeason(1);
      
      // Sort drivers by total_points descending
      const sortedDrivers = drivers.sort((a, b) => +b.total_points - +a.total_points);

      // Podio setup
      if (sortedDrivers.length >= 3) {
        const podioDrivers = sortedDrivers.slice(0, 3);
        const first = podioDrivers[0];
        const second = podioDrivers[1];
        const third = podioDrivers[2];

        this.podio = [
          { posizione: 2, nome: second.driver_username, img: `/assets/images/avatars/${second.driver_username}.png`, colore: this.getColor(second.driver_color) },
          { posizione: 1, nome: first.driver_username, img: `/assets/images/avatars/${first.driver_username}.png`, colore: this.getColor(first.driver_color) },
          { posizione: 3, nome: third.driver_username, img: `/assets/images/avatars/${third.driver_username}.png`, colore: this.getColor(third.driver_color) }
        ];
      } else if (sortedDrivers.length > 0) {
        // Handle cases with fewer than 3 drivers for the podium
        this.podio = sortedDrivers.map((driver, index) => ({
            posizione: index + 1,
            nome: driver.driver_username,
            img: `/assets/images/avatars/${driver.driver_username}.png`,
            colore: this.getColor(driver.driver_color)
        }));
      }

      // Classifica setup
      if (sortedDrivers.length > 3) {
        this.classifica = sortedDrivers.slice(3).map((driver, index) => ({
          posizione: `#${index + 4}`,
          nome: driver.driver_username
        }));
      }
    } catch (error) {
      console.error('Error loading albo d\'oro:', error);
    }
  }
}