/**
 * Exportaciones principales de la carpeta lib
 */

export { default as ApiClient, apiClient } from './apiClient';
export type {
  HttpMethod,
  ApiRequestConfig,
  ApiResponse,
  ApiError,
} from './api.types';
export { ApiClientError } from './api.types';
