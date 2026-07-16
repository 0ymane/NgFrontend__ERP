import { HttpInterceptorFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();


  console.log(
    `%c[HTTP Request] %c${req.method} %c${req.url}`,
    'color: #3b82f6; font-weight: bold;',
    'color: #10b981; font-weight: bold;',
    'color: #94a3b8;',
    { headers: req.headers.keys().reduce((acc: any, key) => { acc[key] = req.headers.get(key); return acc; }, {}), body: req.body }
  );

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          console.log(
            `%c[HTTP Response] %c${req.method} %c${req.url} %c(${event.status}) %ctook ${elapsed}ms`,
            'color: #10b981; font-weight: bold;',
            'color: #10b981; font-weight: bold;',
            'color: #94a3b8;',
            'color: #f59e0b; font-weight: bold;',
            'color: #6b7280;',
            event.body
          );
        }
      },
      error: (error: any) => {
        const elapsed = Date.now() - started;
        console.error(
          `%c[HTTP Error] %c${req.method} %c${req.url} %c(${error.status}) %ctook ${elapsed}ms`,
          'color: #ef4444; font-weight: bold;',
          'color: #ef4444; font-weight: bold;',
          'color: #94a3b8;',
          'color: #ef4444; font-weight: bold;',
          'color: #6b7280;',
          error
        );
      }
    })
  );
};
