import {ApplicationConfig} from "@angular/core";
import {provideRouter} from '@angular/router';
import {HTTP_INTERCEPTORS, provideHttpClient} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {AuthGuard} from "./core/guards/auth.guard";
import {CsrfInterceptor} from "./core/interceptors/csrf.interceptor";
import {AuthService} from "./core/services/auth.service";
import {ProfileService} from "./core/services/profile.service";
import {TaskService} from "./core/services/task.service";
import {providePrimeNG} from "primeng/config";
import {MessageService} from 'primeng/api';
import {routes} from './app.routes';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    AuthGuard,
    AuthService,
    ProfileService,
    TaskService,
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CsrfInterceptor,
      multi: true
    },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.p-dark'
        }
      }
    })
  ]
}
