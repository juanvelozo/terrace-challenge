/**
 * Tipos para el servicio de API
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig extends Omit<RequestInit, 'method' | 'body'> {
  method?: HttpMethod;
  body?: unknown;
  // Opciones específicas de Next.js
  revalidate?: number | false;
  tags?: string[];
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: unknown;
}

export class ApiClientError extends Error implements ApiError {
  status?: number;
  statusText?: string;
  data?: unknown;

  constructor(message: string, status?: number, statusText?: string, data?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}
