export type ConsentArtifact = {
  signature: string;
  created: string;
  expires: string;
  id: string;
  revocable: boolean;
  collector: Collector;
  consumer: Consumer;
  provider: Provider;
  user: User;
  revoker: Revoker;
  purpose: string;
  user_sign: string;
  collector_sign: string;
  frequency: Frequency;
  total_queries_allowed: number;
  log: Log;
  data: string;
  proof: TheProofSchema;
  [k: string]: unknown;
};
export interface Collector {
  id: string;
  url: string;
  [k: string]: unknown;
}
export interface Consumer {
  id: string;
  url: string;
  [k: string]: unknown;
}
export interface Provider {
  id: string;
  url: string;
  [k: string]: unknown;
}
export interface User {
  id: string;
  [k: string]: unknown;
}
export interface Revoker {
  url: string;
  id: string;
  [k: string]: unknown;
}
export interface Frequency {
  ttl: number;
  limit: number;
  [k: string]: unknown;
}
export interface Log {
  consent_use: ConsentUse;
  data_access: DataAccess;
  [k: string]: unknown;
}
export interface ConsentUse {
  url: string;
  [k: string]: unknown;
}
export interface DataAccess {
  url: string;
  [k: string]: unknown;
}
export interface TheProofSchema {
  type: string;
  created: string;
  proofPurpose: string;
  verificationMethod: string;
  jws: string;
  [k: string]: unknown;
}
