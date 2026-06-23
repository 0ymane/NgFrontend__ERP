import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { form, validateStandardSchema, submit, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { signUpSchema } from '@core/forms/auth.schema';


@Component({
  selector: 'sign-up-page',
  standalone: true,
  imports: [RouterLink, FormField],
  templateUrl: './sign-up-page.component.html',

})


export class SignUpPageComponent {
  protected model = signal({
    email: '',
    password: '',
    confirmPassword: ''
  });

  protected signUpForm = form(this.model, (scope) => {
    validateStandardSchema(scope, signUpSchema)
  });

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isSubmitting = signal(false);



  togglePassword() {
    this.showPassword.update(s => !s);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(s => !s);
  }

  protected async onSubmit(event: SubmitEvent) {
    event.preventDefault();

    const state = this.signUpForm();
    if (!state.valid) return;

    submit(this.signUpForm, {
      action: async () => {
        const payload = this.signUpForm().value();
        console.log('Submitted Value:', payload);

        try {
          await new Promise(resolve => setTimeout(resolve, 1500));

          this.model.set({
            email: '',
            password: '',
            confirmPassword: '' });
          this.signUpForm().reset();

        } catch (httpError: any) {
            console.error('Sign up failed:', httpError);
        } finally {
            this.isSubmitting.set(false);
        }
      }
    });
  }
}
