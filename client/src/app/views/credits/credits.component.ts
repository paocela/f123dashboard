import { Component } from '@angular/core';
import {
  CardBodyComponent,
  CardComponent,
  CardImgDirective,
  CardTextDirective,
  CardTitleDirective,
  ColComponent,
  RowComponent
} from '@coreui/angular'

@Component({
  selector: 'app-credits',
  imports: [
    CardComponent,
    CardBodyComponent,
    CardTitleDirective,
    CardTextDirective,
    CardImgDirective,
    ColComponent,
    RowComponent
  ],
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.scss'
})
export class CreditsComponent {

}
