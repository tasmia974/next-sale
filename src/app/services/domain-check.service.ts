import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DomainCheckService {

  @Injectable({ providedIn: 'root' })
  private apiUrl = "api/checks/run";
  private apiReport = "/api/report";

  constructor(private http: HttpClient) { }

  runChecks(payload: { domain: string; name?: string; phone?: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  downloadReport(payload: any) {
    return this.http.post(this.apiReport, payload, {
      responseType: 'blob'
    });
  }

}
