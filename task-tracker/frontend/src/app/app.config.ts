import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthGuard } from "./core/guards/auth.guard";
import { AuthService } from "./core/services/auth.service";
import { ProfileService } from "./core/services/profile.service";
import { TaskService } from "./core/services/task.service";
import { providePrimeNG } from "primeng/config";
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';

import { Observable } from 'rxjs';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient, public prefix: string = './assets/i18n/', public suffix: string = '.json') { }
  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    AuthGuard,
    AuthService,
    ProfileService,
    TaskService,
    MessageService,
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
