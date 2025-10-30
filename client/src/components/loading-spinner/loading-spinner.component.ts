import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../app/service/loading.service';
import { SpinnerComponent } from '@coreui/angular';

@Component({
    selector: 'app-loading-spinner',
    templateUrl: './loading-spinner.component.html',
    styleUrls: ['./loading-spinner.component.scss'],
    imports: [CommonModule, SpinnerComponent]
})
export class LoadingSpinnerComponent {
  private loadingService = inject(LoadingService);

  loading$;

  constructor() {
    this.loading$ = this.loadingService.loading$;
  }
}