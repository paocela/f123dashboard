import { Routes } from '@angular/router';
import { PlaygroundComponent } from './playground.component';

export const routes: Routes = [
  {
    path: '',
    component: PlaygroundComponent,
    data: {
      title: 'Playground'
    }
  }
];
