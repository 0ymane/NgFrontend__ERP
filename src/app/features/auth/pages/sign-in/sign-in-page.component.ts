import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, validateStandardSchema, FormField } from '@angular/forms/signals';
import {signInSchema} from '@core/forms/auth.schema'

@Component({
  selector: 'sign-in-page',
  imports: [RouterLink, FormField],
  templateUrl: './sign-in-page.component.html',
})

export class SignInPageComponent {
  showPassword = signal(false);
  isSubmitting = signal(false);

  private signInModel = signal({
    email: '',
    password: ''
  });

  protected signInForm = form(this.signInModel, (scope) => {
    validateStandardSchema(scope, signInSchema);
  });

  togglePassword() {
    this.showPassword.update(show => !show);
  }

  protected async onSubmit(event: SubmitEvent) {
    event.preventDefault();

    const state = this.signInForm();
    if (!state.valid) return;

    this.isSubmitting.set(true);

    try {
      const payload = this.signInModel();

    //   await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Sign in successful!', payload);


      this.signInModel.set({
        email: '',
        password: ''
      });

      this.signInForm().reset();


    } catch (httpError: any) {

      console.error('Sign in failed:', httpError);

    } finally {

      this.isSubmitting.set(false);

    }
  }
}
