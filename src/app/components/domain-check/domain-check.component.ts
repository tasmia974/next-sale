import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomainCheckService } from '../../services/domain-check.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import saveAs from 'file-saver';


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
  fullDetail: any;

  constructor(private fb: FormBuilder, private service: DomainCheckService) { }

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

  openDetail() {
    this.fullDetail = !this.fullDetail
  }

  onReset() {
    this.checkForm.reset()
  }

  /** Submit */
  onSubmit(): void {
    this.submitted = true;

    if (this.checkForm.invalid) {
      return;
    }

    this.loading = true;
    this.results = null;
    const payload: any = { domain: this.checkForm.value.domain };

    this.service.runChecks(payload).subscribe({
      next: (res) => {
        this.results = res;
        this.loading = false;
      }
    })
  }

  get f() {
    return this.checkForm.controls;
  }


  generateReport() {
    const payload: any = {
      submittedBy: {
        domain: this.checkForm.value.domain,
        name: this.checkForm.value.name,
        phone: this.checkForm.value.phone,
      },
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
      status: 'Passed with warnings',
      recommendations: ['Use optimized images', 'Minify JavaScript']
    };

    this.service.downloadReport(payload).subscribe({
      next: (pdfBlob: Blob) => {
        saveAs(pdfBlob, 'website-report.pdf');
        this.loading = false;
      },
      error: (err) => {
        console.error('Download failed', err);
        this.loading = false;
      }
    });
  }
}
