import { QueryClient } from "@tanstack/react-query";

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<any> {
  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body && requestOptions.method !== 'GET') {
    requestOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, requestOptions);
  } catch (networkError: any) {
    // Check if request was cancelled (normal during logout)
    if (networkError.name === 'AbortError') {
      console.log(`Request cancelled for ${url}`);
      console.log('Request cancelled - this is normal during navigation');
      throw networkError; // Let the calling code handle cancellation
    }
    // Handle other network errors gracefully - don't show runtime error overlay
    console.warn(`Network error for ${url}:`, networkError);
    throw new Error('Network connection failed');
  }
  
  if (!response.ok) {
    // Try to parse error message from response body
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch (e) {
      // If we can't parse the JSON, use the default error message
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries to prevent multiple error overlays
      refetchOnWindowFocus: false, // Prevent refetch on focus that could cause errors after logout
      queryFn: async ({ queryKey, signal }) => {
        const url = Array.isArray(queryKey) ? queryKey.join('/') : String(queryKey);
        try {
          const response = await fetch(url, {
            credentials: 'include', // Include cookies for session
            signal, // Allow cancellation
          });
          
          if (!response.ok) {
            // Don't show runtime errors for auth failures after logout
            if (response.status === 401 && url.includes('/api/auth/me')) {
              console.log('Auth check failed - user logged out');
              throw new Error('Not authenticated');
            }
            const errorMessage = `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
          }
          
          return response.json();
        } catch (networkError: any) {
          // Check if request was cancelled (normal during logout/navigation)
          if (networkError.name === 'AbortError') {
            console.log(`Request cancelled for ${url}`);
            throw networkError; // Let React Query handle cancellation gracefully
          }
          // Handle other network errors gracefully - don't show runtime error overlay
          console.warn(`Network error for ${url}:`, networkError);
          throw new Error('Network connection failed');
        }
      },
    },
  },
});