import { Component } from '@angular/core';
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
  loading$;

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }
}