import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth-store';

export class ApiError extends Error {
  status: number;
  code: string;
  userMessage: string;
  validationErrors?: { field: string; message: string }[];
  requestId?: string;

  constructor(status: number, data: unknown) {
    let errorData = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
    
    // Unwrap the { success, error } envelope if it exists
    if (errorData && 'error' in errorData && typeof errorData.error === 'object' && errorData.error !== null) {
      errorData = errorData.error as Record<string, unknown>;
    }

    super((errorData.message as string) || (errorData.userMessage as string) || 'An error occurred while communicating with the server.');
    this.name = 'ApiError';
    this.status = status;
    this.code = (errorData.code as string) || 'UNKNOWN_ERROR';
    this.userMessage = (errorData.userMessage as string) || 'An unexpected error occurred. Please try again.';
    this.validationErrors = errorData.validationErrors as { field: string; message: string }[] | undefined;
    this.requestId = errorData.requestId as string | undefined;
  }
}

interface FetchOptions extends RequestInit {
  _retry?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Access Token
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for HttpOnly refresh token
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized with silent refresh
    if (response.status === 401 && !options._retry && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
          .then(async (res) => {
            if (!res.ok) throw new Error('Refresh failed');
            const json = await res.json();
            const token = json.data?.accessToken;
            if (!token) throw new Error('No access token in response');
            useAuthStore.getState().setAccessToken(token);
            return token;
          })
          .catch(() => {
            useAuthStore.getState().clearAuth();
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        const newAccessToken = await refreshPromise;
        if (newAccessToken) {
          // Retry original request exactly once
          const retryHeaders = new Headers(options.headers);
          if (!retryHeaders.has('Content-Type') && !(options.body instanceof FormData)) {
            retryHeaders.set('Content-Type', 'application/json');
          }
          retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
          
          const retryResponse = await fetch(url, { ...config, headers: retryHeaders, _retry: true } as FetchOptions);
          
          if (!retryResponse.ok) {
            let errorData;
            try { errorData = await retryResponse.json(); } catch { errorData = { userMessage: retryResponse.statusText }; }
            throw new ApiError(retryResponse.status, errorData);
          }
          
          return processSuccessfulResponse<T>(retryResponse);
        }
      } catch {
        // Token refresh failed (e.g., token expired or invalid) error handling below
        // The clearAuth() has already been called in the catch block of refreshPromise
      }
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { userMessage: response.statusText || 'An unexpected error occurred.' };
      }
      throw new ApiError(response.status, errorData);
    }

    return processSuccessfulResponse<T>(response);

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, { userMessage: 'Network error or unable to reach the server.' });
  }
}

async function processSuccessfulResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  
  const json = await response.json();
  
  // Unwrap the { success, data, meta } envelope if present
  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    return json.data as T;
  }
  
  return json as T;
}
