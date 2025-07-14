import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ButtonModule } from '@coreui/angular';
import { cibInstagram, cibTwitch } from '@coreui/icons';

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

  @Input() title: string = '';
  @Input() linkName: string = '';
  @Input() linkUrl: string = '';
  @Input() icon : string[] = cibInstagram;
  @Input() color: string = '#000000'; // Default color

  isLargeScreen: boolean = false;
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
    cibInstagram,
    cibTwitch
  };