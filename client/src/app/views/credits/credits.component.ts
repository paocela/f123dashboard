import { Component } from '@angular/core';
import {
  CardBodyComponent,
  CardComponent,
  CardImgDirective,
  CardTitleDirective,
  ColComponent,
  RowComponent,
  ButtonDirective
} from '@coreui/angular'

@Component({
  selector: 'app-credits',
  imports: [
    CardComponent,
    CardBodyComponent,
    CardTitleDirective,
    CardImgDirective,
    ColComponent,
    RowComponent,
    ButtonDirective
  ],
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.scss'
})
export class CreditsComponent {

}
