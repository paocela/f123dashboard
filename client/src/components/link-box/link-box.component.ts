import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ButtonModule } from '@coreui/angular';
import { cilLink, cibInstagram, cibTwitch } from '@coreui/icons';

@Component({
    selector: 'app-link-box',
    imports: [
        CommonModule,
        IconDirective,
        ButtonModule
    ],
    templateUrl: './link-box.component.html',
    styleUrl: './link-box.component.scss'
})

export class LinkBoxComponent implements OnDestroy {

  @Input() title = '';
  @Input() linkName = '';
  @Input() linkUrl = '';
  @Input() icon : string[] = cilLink;
  @Input() color = '#000000'; // Default color

  isLargeScreen = false;
  private resizeHandler = () => this.checkScreenSize();

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeHandler);
  }

  private checkScreenSize() {
    this.isLargeScreen = window.innerWidth > 1000;
  }

  goTo() {
    console.log('Link clicked:', this.linkUrl);
    if (this.linkUrl) {
        window.open(this.linkUrl, '_blank');
    }
}

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }
}

export const icons = {
    cilLink,
    cibInstagram,
    cibTwitch
  };