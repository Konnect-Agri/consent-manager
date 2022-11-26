import { AxiosRequestConfig } from "@nestjs/terminus/dist/health-indicator/http/axios.interfaces";

export interface Collector {
    id: string;
    url: string;
}

export interface Consumer {
    id: string;
    url: string;
}

export interface Provider {
    id: string;
    url: string;
}

export interface User {
    type: string;
    name: string;
    issuer: string;
    dpID: string;
    cmID: string;
    dcID: string;
}

export interface Revoker {
    url: string;
    name: string;
    id: string;
}

export interface Frequency {
    ttl: number;
    limit: number;
    total_queries_allowed: number;
}

export interface ConsentUse {
    url: string;
}

export interface DataAccess {
    url: string;
}

export interface Log {
    consent_use: ConsentUse;
    data_access: DataAccess;
}

export class CAObject {
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
    total_query_count: number;
    log: Log;
    data: string;
}

export class GetCAResponse extends CAObject {
    query_count: number;
}

export enum CAStates {
    CREATED = "CREATED",
    ACCEPT = "ACCEPT",
    DECLINE = "DECLINE",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED",
}

export interface WebhookRequest {
    url: String;
    options: AxiosRequestConfig;
}

export class ConsentAction {
    status: string;
    payload: any;
}

export class RequestBody { 
    ca: CAObject;
    userId: string; 
    webhookUrl: WebhookRequest; 
}
