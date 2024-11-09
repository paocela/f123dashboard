import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER  } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import {DbDataService} from 'src/app/service/db-data.service';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';

import { DropdownModule, SidebarModule } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';
import { routes } from './app.routes';

export function initializeApp(dbDataService: DbDataService) {
  return () => dbDataService.queryAllDrivers(); // Funzione di inizializzazione dei dati
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withHashLocation()
    ),
    importProvidersFrom(SidebarModule, DropdownModule),
    IconSetService,
    provideAnimations(),

    provideHttpClient(),
    DbDataService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [DbDataService],
      multi: true
    }
  ]
};
