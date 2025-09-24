import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomainCheckService } from '../../services/domain-check.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import saveAs from 'file-saver';
import { ChecksResult } from '../../models/check-results.model';
import { domainAsyncValidator } from '../../models/domain-check-validation';


@Component({
  selector: 'app-domain-check',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './domain-check.component.html',
  styleUrls: ['./domain-check.component.scss']
})
export class DomainCheckComponent {
  checkForm: FormGroup;
  submitted = false;
  loading = false;
  results: ChecksResult | null = null;
  message: string | null = null;

  constructor(private fb: FormBuilder, private api: DomainCheckService) {
    this.checkForm = this.fb.group({
      domain: ['', [
        Validators.required,
        Validators.pattern(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i)
      ], [domainAsyncValidator(this.api)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+0-9\s\-()]{6,}$/)]],
      spamProtection: [false, Validators.requiredTrue]
    });
  }

  get f() { return this.checkForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.message = null;
    if (this.checkForm.invalid) return;
    this.loading = true;
    const { domain, name, phone } = this.checkForm.value;
    this.api.runChecks(domain, name, phone).subscribe({
      next: (res) => { this.results = res; this.loading = false; },
      error: (err) => { this.message = err.message || 'Unexpected error'; this.loading = false; }
    });
  }

  onDownloadReport() {
    if (!this.results) return;
    const payload = {
      domain: this.results.submittedBy.domain,
      name: this.results.submittedBy.name,
      phone: this.results.submittedBy.phone,
      status: this.results.ssl?.status || 'N/A',
      recommendations: {
         ssl: {
        host: this.results.ssl.host,
        port: this.results.ssl.port,
        protocol: this.results.ssl.protocol,
        isPublic: this.results.ssl.isPublic,
        status: this.results.ssl.status,
        startTime: this.results.ssl.startTime,
        engineVersion: this.results.ssl.engineVersion,
        criteriaVersion: this.results.ssl.criteriaVersion,
      },
      w3c: {
        url: this.results.w3c.url,
        messages: [
          {
            type: this.results.w3c.messages[0].message,
            url: this.results.w3c.messages[0].url,
            subType: this.results.w3c.messages[0].subType,
            message: this.results.w3c.messages[0].message
          }
        ]
      },
      }
    };
    this.api.downloadReport(payload).subscribe({
      next: (res) => {
        const cd = res.headers.get('content-disposition') || '';
        const match = /filename="?([^"]+)"?/.exec(cd);
        const filename = match ? match[1] : `${payload.domain}-report.pdf`;
        saveAs(res.body!, filename);
      },
      error: (err) => { this.message = err.message || 'Failed to download report'; }
    });
  }
}
