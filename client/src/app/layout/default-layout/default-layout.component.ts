import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';

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

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './default-layout.component.html',
    styleUrls: ['./default-layout.component.scss'],
    imports: [
        SidebarComponent,
        SidebarHeaderComponent,
        SidebarBrandComponent,
        RouterLink,
        NgScrollbar,
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
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  private userSubscription?: Subscription;
  
  constructor(
    private authService: AuthService, 
  ) {}

  public navItems = getNavItems(false);

  ngOnInit(): void {
    // Subscribe to user changes to update navigation
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.navItems = getNavItems(user?.isAdmin ?? false);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
  
  onScrollbarUpdate($event: any) {
    // if ($event.verticalUsed) {
    // console.log('verticalUsed', $event.verticalUsed);
    // }
  }

  updateNavItems()
  {
    this.navItems = getNavItems(this.authService.getCurrentUser()?.isAdmin ?? false);
  }
}
