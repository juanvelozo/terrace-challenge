/**
 * Cliente HTTP para consumir APIs usando fetch de Next.js
 * 
 * Este servicio aprovecha las extensiones de Next.js para fetch:
 * - Caché automático en el servidor
 * - Revalidación de datos
 * - Tags para invalidación de caché
 */

import { ApiRequestConfig, ApiResponse, ApiClientError } from './api.types';

/**
 * Configuración por defecto del cliente API
 */
const DEFAULT_CONFIG: Partial<ApiRequestConfig> = {
    headers: {},
};

/**
 * Clase principal del cliente API
 */
class ApiClient {
    private baseURL: string;
    private defaultHeaders: HeadersInit;

    constructor(baseURL: string = '', defaultHeaders: HeadersInit = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            ...DEFAULT_CONFIG.headers,
            ...defaultHeaders,
        };
    }

    /**
     * Método privado para realizar peticiones HTTP
     */
    private async request<T = unknown>(
        endpoint: string,
        config: ApiRequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const {
            method = 'GET',
            body,
            headers = {},
            revalidate,
            tags,
            ...restConfig
        } = config;

        // Construir la URL completa
        const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;

        // Preparar headers
        const requestHeaders = {
            ...this.defaultHeaders,
            ...headers,
        };

        // Preparar opciones de fetch
        const fetchOptions: RequestInit = {
            method,
            headers: requestHeaders,
            ...restConfig,
        };

        // Agregar body si existe (excepto para GET)
        if (body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(body);
            // Agregar Content-Type solo cuando hay body
            fetchOptions.headers = {
                ...requestHeaders,
                'Content-Type': 'application/json',
            };
        }

        // Agregar opciones específicas de Next.js
        if (revalidate !== undefined) {
            fetchOptions.next = {
                ...fetchOptions.next,
                revalidate,
            };
        }

        if (tags && tags.length > 0) {
            fetchOptions.next = {
                ...fetchOptions.next,
                tags,
            };
        }

        try {
            const response = await fetch(url, fetchOptions);

            // Intentar parsear la respuesta como JSON
            let data: T;
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text() as T;
            }

            // Si la respuesta no es exitosa, lanzar error
            if (!response.ok) {
                throw new ApiClientError(
                    `Error en la petición: ${response.statusText}`,
                    response.status,
                    response.statusText,
                    data
                );
            }

            return {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            };
        } catch (error) {
            // Re-lanzar ApiClientError
            if (error instanceof ApiClientError) {
                throw error;
            }

            // Error de red u otro tipo de error
            throw new ApiClientError(
                error instanceof Error ? error.message : 'Error desconocido en la petición',
                undefined,
                undefined,
                error
            );
        }
    }

    /**
     * Método GET
     */
    async get<T = unknown>(
        endpoint: string,
        config?: Omit<ApiRequestConfig, 'method' | 'body'>
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    /**
     * Método POST
     */
    async post<T = unknown>(
        endpoint: string,
        body?: unknown,
        config?: Omit<ApiRequestConfig, 'method' | 'body'>
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'POST', body });
    }

    /**
     * Método PUT
     */
    async put<T = unknown>(
        endpoint: string,
        body?: unknown,
        config?: Omit<ApiRequestConfig, 'method' | 'body'>
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'PUT', body });
    }

    /**
     * Método PATCH
     */
    async patch<T = unknown>(
        endpoint: string,
        body?: unknown,
        config?: Omit<ApiRequestConfig, 'method' | 'body'>
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
    }

    /**
     * Método DELETE
     */
    async delete<T = unknown>(
        endpoint: string,
        config?: Omit<ApiRequestConfig, 'method' | 'body'>
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }

    /**
     * Actualizar baseURL
     */
    setBaseURL(baseURL: string): void {
        this.baseURL = baseURL;
    }

    /**
     * Actualizar headers por defecto
     */
    setDefaultHeaders(headers: HeadersInit): void {
        this.defaultHeaders = {
            ...this.defaultHeaders,
            ...headers,
        };
    }
}

/**
 * Instancia por defecto del cliente API
 * Puedes configurar la baseURL desde variables de entorno
 */
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || '');

/**
 * Exportar la clase para crear instancias personalizadas
 */
export { ApiClient };
export default ApiClient;
