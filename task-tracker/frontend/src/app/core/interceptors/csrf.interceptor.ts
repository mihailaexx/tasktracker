import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  private csrfToken: string | null = null;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].indexOf(req.method.toUpperCase()) !== -1) {
      return next.handle(req).pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // Extract CSRF token from response headers if present
            const csrfToken = event.headers.get('XSRF-TOKEN');
            if (csrfToken) {
              this.csrfToken = csrfToken;
            } else {
              // Try to get CSRF token from cookie
              const tokenFromCookie = this.getCsrfTokenFromCookie();
              if (tokenFromCookie) {
                this.csrfToken = tokenFromCookie;
              }
            }
          }
        })
      );
    }

    // For state-changing requests, ensure we have a CSRF token
    return this.getToken().pipe(
      switchMap(token => {
        let clonedReq = req;
        if (token) {
          clonedReq = req.clone({
            headers: req.headers.set('X-XSRF-TOKEN', token)
          });
        }
        return next.handle(clonedReq);
      })
    );
  }

  private getToken(): Observable<string | null> {
    // Try to get token from cookie if we don't have it
    if (!this.csrfToken) {
      this.csrfToken = this.getCsrfTokenFromCookie();
    }
    
    return from([this.csrfToken]);
  }

  private getCsrfTokenFromCookie(): string | null {
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }
}