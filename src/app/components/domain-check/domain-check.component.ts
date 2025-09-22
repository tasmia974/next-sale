import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomainCheckService } from '../../services/domain-check.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-domain-check',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './domain-check.component.html',
  styleUrls: ['./domain-check.component.scss']
})
export class DomainCheckComponent {
  loading = false;
  results: any = null;
  checkForm!: FormGroup;
  submitted = false;

  constructor(private http: HttpClient, private fb: FormBuilder, private service: DomainCheckService) { }

  ngOnInit(): void {
    this.checkForm = this.fb.group({
      domain: [
        '',
        [
          Validators.required,
        ],
      ],
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)
        ]
      ],
      spamProtection: [false, Validators.requiredTrue]
    });
  }

  /** Async Validator: Simulates domain availability check */
  private domainAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      // Example check: call a public API (here mocked with delay)
      return this.http
        .get(`https://api.ssllabs.com/api/v3/analyze?host=${control.value}`)
        .pipe(
          delay(1000), // simulate network delay
          map(() => null), // if reachable → valid
          catchError(() => of({ asyncExists: true })) // if unreachable → invalid
        );
    };
  }

  /** Submit */
  onSubmit(): void {
    this.submitted = true;

    if (this.checkForm.invalid) {
      return;
    }

    this.loading = true;
    this.results = null;
    const payload: any = {domain: this.checkForm.value.domain };
    // if (this.checkForm.value.name) payload.name = this.checkForm.value.name;
    // if (this.checkForm.value.phone) payload.phone = this.checkForm.value.phone;

    this.service.runChecks(payload).subscribe({
      next: (res) => {
        this.results = res;
        this.loading = false;
      }
    })
    setTimeout(() => {
      this.loading = false;
      this.results = {
        score: 57, // demo
        checks: [
          { label: 'Viewport OK', status: 'pass' },
          { label: 'Font-size check not available', status: 'info' },
          { label: 'Tap-targets check not available', status: 'info' },
          { label: 'Content-width check not available', status: 'info' },
          { label: 'No responsive images', status: 'fail' }
        ],
        apiUnavailable: false
      };
    }, 2000);
  }

  // Helper for easier access in template
  get f() {
    return this.checkForm.controls;
  }


  generateReport() {
    const payload = {
      // domain: this.domain,
      // name: this.name,
      // phone: this.phone,
      status: 'Passed with warnings',
      recommendations: ['Use optimized images', 'Minify JavaScript']
    };

    // this.service.downloadReport(payload).subscribe((pdfBlob) => {
    //   const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    //   const url = window.URL.createObjectURL(blob);

    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = 'website-report.pdf';
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    // });
  }
}
