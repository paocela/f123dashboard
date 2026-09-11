import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { getNavItems } from './_nav';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { AuthService } from './../../service/auth.service';
import { FeatureFlagsService } from '../../service/feature-flags.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './default-layout.component.html',
    styleUrls: ['./default-layout.component.scss'],
    imports: [
        CommonModule,
        SidebarComponent,
        SidebarHeaderComponent,
        SidebarBrandComponent,
        RouterLink,
        SidebarNavComponent,
        SidebarFooterComponent,
        SidebarToggleDirective,
        SidebarTogglerDirective,
        DefaultHeaderComponent,
        ShadowOnScrollDirective,
        ContainerComponent,
        RouterOutlet,
        DefaultFooterComponent,
        LoadingSpinnerComponent
    ]
})
export class DefaultLayoutComponent {
  private authService = inject(AuthService);
  private featureFlagsService = inject(FeatureFlagsService);

  // Use computed to reactively update navigation based on user
  public navItems = computed(() => 
    getNavItems(this.authService.currentUser()?.isAdmin ?? false, this.featureFlagsService.fantaEnabled())
  );
}
