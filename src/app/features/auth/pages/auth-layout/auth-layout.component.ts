import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgOptimizedImage],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  private router = inject(Router);


  isSignInRoute = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url.includes('sign-in'))
    ),
    { initialValue: this.router.url.includes('sign-in') }
  );
}
