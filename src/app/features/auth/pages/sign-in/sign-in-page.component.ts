import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, validateStandardSchema, submit, FormField } from '@angular/forms/signals';
import { signInSchema, SignInForm } from '@core/forms/auth.schema';
import { AuthStore } from '@features/auth/auth.store';

@Component({
  selector: 'sign-in-page',
  imports: [RouterLink, FormField],
  templateUrl: './sign-in-page.component.html',
})
export class SignInPageComponent {
  protected authStore = inject(AuthStore);

  showPassword = signal(false);

  private signInModel = signal<SignInForm>({
    email: '',
    password: ''
  });

  protected signInForm = form(this.signInModel, (scope) => {
    validateStandardSchema(scope, signInSchema);
  });

  constructor() {
    this.authStore.clearError();
  }

  togglePassword() {
    this.showPassword.update(show => !show);
  }

  protected onSubmit(event: SubmitEvent) {
    event.preventDefault();

    const state = this.signInForm();
    if (!state.valid) return;

    submit(this.signInForm, {
      action: async () => {
        try {
          const payload = this.signInForm().value();
          await this.authStore.login(payload);
          this.signInModel.set({
            email: '',
            password: ''
          });
          this.signInForm().reset();
        } catch (err) {
          // Error is captured and exposed via AuthStore.error signal
          console.error('Sign in failed:', err);
        }
      }
    });
  }
}
