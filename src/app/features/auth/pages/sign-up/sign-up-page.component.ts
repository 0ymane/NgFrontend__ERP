import { Component, signal, inject } from '@angular/core';
import { form, validateStandardSchema, submit, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { signUpSchema, SignUpForm } from '@core/forms/auth.schema';
import { AuthStore } from '@features/auth/auth.store';

@Component({
  selector: 'sign-up-page',
  imports: [RouterLink, FormField],
  templateUrl: './sign-up-page.component.html',
})
export class SignUpPageComponent {
  protected authStore = inject(AuthStore);

  protected model = signal<SignUpForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  protected signUpForm = form(this.model, (scope) => {
    validateStandardSchema(scope, signUpSchema);
  });

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor() {
    this.authStore.clearError();
  }

  togglePassword() {
    this.showPassword.update(s => !s);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(s => !s);
  }

  protected onSubmit(event: SubmitEvent) {
    event.preventDefault();

    const state = this.signUpForm();
    if (!state.valid) return;

    submit(this.signUpForm, {
      action: async () => {
        try {
          const payload = this.signUpForm().value();
          await this.authStore.register(payload);
          this.model.set({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          this.signUpForm().reset();
        } catch (err) {
          // Error is captured and exposed via AuthStore.error signal
          console.error('Sign up failed:', err);
        }
      }
    });
  }
}
