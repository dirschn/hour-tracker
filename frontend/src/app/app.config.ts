import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Configuration, BASE_PATH } from '../generated-api';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // API Configuration
    { provide: BASE_PATH, useValue: 'http://localhost:3000' },
    {
      provide: Configuration,
      useFactory: () => new Configuration({
        basePath: 'http://localhost:3000',
      })
    }
  ]
};
