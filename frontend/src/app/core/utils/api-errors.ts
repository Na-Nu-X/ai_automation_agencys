import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ApiFieldErrors } from '../models/api.models';

/**
 * Applies DRF field errors to matching form controls (as `server` errors) and
 * returns a user-facing summary message in Slovak.
 */
export function applyServerErrors(form: FormGroup, error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Nastala neočakávaná chyba. Skúste to prosím znova.';
  }
  if (error.status === 0) {
    return 'Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie a skúste to znova.';
  }
  if (error.status === 429) {
    return 'Odoslali ste príliš veľa požiadaviek. Skúste to prosím o chvíľu.';
  }
  if (error.status === 400 && error.error && typeof error.error === 'object') {
    const fieldErrors = error.error as ApiFieldErrors;
    let unmatched: string[] = [];
    for (const [field, messages] of Object.entries(fieldErrors)) {
      const control: AbstractControl | null = form.get(field);
      const text = Array.isArray(messages) ? messages.join(' ') : String(messages);
      if (control) {
        control.setErrors({ ...(control.errors ?? {}), server: text });
        control.markAsTouched();
      } else {
        unmatched = [...unmatched, text];
      }
    }
    return unmatched.length ? unmatched.join(' ') : 'Skontrolujte prosím zvýraznené polia.';
  }
  return 'Server momentálne neodpovedá. Skúste to prosím neskôr alebo nám napíšte e-mail.';
}

/** Slovak validation message for a control, or null if valid/untouched. */
export function controlError(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const e = control.errors;
  if (e['server']) return e['server'] as string;
  // Validators.requiredTrue reports its failure under the `required` key.
  if (e['required'] && typeof control.value === 'boolean') {
    return 'Pre odoslanie je potrebný súhlas so spracovaním osobných údajov.';
  }
  if (e['required']) return 'Toto pole je povinné.';
  if (e['email']) return 'Zadajte platnú e-mailovú adresu.';
  if (e['minlength']) return `Zadajte aspoň ${e['minlength'].requiredLength} znaky.`;
  if (e['maxlength']) return `Maximálna dĺžka je ${e['maxlength'].requiredLength} znakov.`;
  if (e['pattern']) return 'Zadajte hodnotu v platnom formáte.';
  return 'Neplatná hodnota.';
}
