export interface SubmittedBy {
  name: string | null;
  phone: string | null;
  domain: string;
}

export interface Endpoint {
  ipAddress: string;
  statusMessage: string;
  delegation?: number;
}


export interface SSLResult {
  status?: string;
  endpoints?: Endpoint[];[k: string]: any;
}


export interface W3CMessage {
  type: string;
  url?: string;
  subType?: string;
  message?: string;
}


export interface W3CResult {
  url?: string;
  messages?: W3CMessage[];[k: string]: any;
}


export interface ChecksResult {
  submittedBy: SubmittedBy;
  ssl: SSLResult | any;
  mozilla: any;
  w3c: W3CResult | any;
  pageSpeed: any;
}

