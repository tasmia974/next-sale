import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { DomainCheckService } from '../services/domain-check.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export function domainAsyncValidator(api: DomainCheckService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const domain = control.value;
    if (!domain) return of(null);
    return api.validateDomain(domain).pipe(
      map((result: any) => result.valid ? null : { invalidDomain: true }),
      catchError(() => of({ invalidDomain: true }))
    );
  };
}
