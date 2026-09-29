import { Component, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ListGroupDirective,
  ListGroupItemDirective
} from '@coreui/angular';
import type { Constructor } from '@f123dashboard/shared';
import { FeatureFlagsService } from '../../service/feature-flags.service';

@Component({
  selector: 'app-constructor-card',
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ListGroupDirective,
    ListGroupItemDirective
  ],
  templateUrl: './constructor-card.component.html',
  styleUrl: './constructor-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConstructorCardComponent {
  private featureFlagsService = inject(FeatureFlagsService);
  constructorData = input.required<Constructor>();
  position = input.required<number>();
  readonly freePracticeEnabled = this.featureFlagsService.freePracticeEnabled;
}
