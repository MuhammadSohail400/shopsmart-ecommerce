import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';

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

    const defaultMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Please sign in to continue.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'A conflict occurred. Please review your details and try again.',
      422: 'Validation error. Please check your inputs.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Something went wrong on our end. Please try again shortly.',
    };

    const userMessage =
      (errorData.userMessage as string) ||
      (errorData.message as string) ||
      defaultMessages[status] ||
      'An unexpected error occurred. Please try again.';

    super(userMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = (errorData.code as string) || `HTTP_${status}`;
    this.userMessage = userMessage;
    this.validationErrors = errorData.validationErrors as { field: string; message: string }[] | undefined;
    this.requestId = errorData.requestId as string | undefined;
  }
}

interface FetchOptions extends RequestInit {
  _retry?: boolean;
}

let lastSessionExpiryToastTime = 0;
function notifySessionExpired() {
  const now = Date.now();
  if (now - lastSessionExpiryToastTime > 5000) {
    lastSessionExpiryToastTime = now;
    toast.error('Your session has expired. Please sign in again.');
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Access Token or Guest Cart ID
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  } else {
    const { guestCartId } = useCartStore.getState();
    if (guestCartId) {
      headers.set('X-Guest-Cart-Id', guestCartId);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for HttpOnly refresh token
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized with silent refresh only for users who had a session
    if (response.status === 401 && !options._retry && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
      const isServer = typeof window === 'undefined';
      const hadSession = Boolean(
        accessToken || (!isServer && localStorage.getItem('has_session') === 'true')
      );

      // Only attempt refresh and notify expiration if the user actually had an authenticated session
      if (hadSession) {
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
              notifySessionExpired();
              return null;
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
        } catch (err) {
          if (err instanceof ApiError) throw err;
        }
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
  
  // Unwrap the { success, data, pagination } envelope if present
  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    if ('pagination' in json) {
      return { data: json.data, pagination: json.pagination } as unknown as T;
    }
    return json.data as T;
  }
  
  return json as T;
}
