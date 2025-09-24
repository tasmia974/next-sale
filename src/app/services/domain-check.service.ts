import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, throwError, timeout, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChecksResult } from '../models/check-results.model';

@Injectable({ providedIn: 'root' })
export class DomainCheckService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  runChecks(domain: string, name?: string, phone?: string): Observable<ChecksResult> {
    return this.http.post<ChecksResult>(`${this.base}/checks/run`, { domain, name, phone })
      .pipe(timeout(20000), catchError(this.handleError));
  }

  validateDomain(domain: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.base}/validate-domain`, { domain })
      .pipe(timeout(5000), catchError(this.handleError));
  }

  downloadReport(payload: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.base}/report`, payload, { responseType: 'blob', observe: 'response' })
      .pipe(timeout(30000), catchError(this.handleError));
  }

  private handleError(err: any) {
    let msg = 'Server error';
    if (err?.name === 'TimeoutError') msg = 'Request timed out';
    else if (err?.error?.error) msg = err.error.error;
    else if (err?.message) msg = err.message;
    return throwError(() => new Error(msg));
  }
}
