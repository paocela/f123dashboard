import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
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
import { TwitchApiService } from './service/twitch-api.service';

export function initializeApp(dbDataService: DbDataService, twitchApiService: TwitchApiService) {
  return async () => {
    await dbDataService.AllData();
    await twitchApiService.checkStreamStatus();
  };
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
    TwitchApiService,
    provideAppInitializer(() => {
        const initializerFn = (initializeApp)(inject(DbDataService), inject(TwitchApiService));
        return initializerFn();
      })
  ]
};
