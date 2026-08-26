<<<<<<< HEAD
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
=======
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
>>>>>>> ab5f8e4256487e47649150361723bf6a0f40cab7

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
<<<<<<< HEAD
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
=======
    provideRouter(routes)
  ]
};
>>>>>>> ab5f8e4256487e47649150361723bf6a0f40cab7
