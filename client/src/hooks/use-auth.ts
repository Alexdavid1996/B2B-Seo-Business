import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ADMIN_BASE_PATH, EMPLOYEE_BASE_PATH } from "@/lib/constants";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  bio?: string;
  avatar?: string;
  status: string;
  role: string;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize from localStorage and verify with server
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Verify session with server
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
          });
          
          if (response.ok) {
            const { user: serverUser } = await response.json();
            setUser(serverUser);
            localStorage.setItem('user', JSON.stringify(serverUser));
          } else {
            // Session expired, clear local storage
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        // No stored user, check if server has session
        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
          });
          
          if (response.ok) {
            const { user: serverUser } = await response.json();
            setUser(serverUser);
            localStorage.setItem('user', JSON.stringify(serverUser));
          }
        } catch (error) {
          // No server session
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        // Make single logout request
        return await apiRequest('/api/auth/logout', {
          method: 'POST'
        });
      } catch (error) {
        console.log('Logout request failed, but continuing with client cleanup');
        return { message: 'Logged out successfully' };
      }
    },
    onMutate: () => {
      // Immediately clear user state to prevent UI flickering
      setUser(null);
      localStorage.removeItem('user');
    },
    onSettled: () => {
      // Always clean up regardless of success/failure
      localStorage.clear();
      sessionStorage.clear();
      
      // Cancel ongoing queries to prevent AbortError
      queryClient.cancelQueries();
      queryClient.clear();
      queryClient.removeQueries({ queryKey: ['/api/auth/me'] });
      
      console.log('Logout complete - all client state cleared');
      
      // Single redirect based on current path
      const currentPath = window.location.pathname;
      let redirectUrl = '/auth';

      if (currentPath.startsWith(ADMIN_BASE_PATH)) {
        redirectUrl = ADMIN_BASE_PATH;
      } else if (currentPath.startsWith(EMPLOYEE_BASE_PATH)) {
        redirectUrl = EMPLOYEE_BASE_PATH;
      }
      
      // Use location change instead of href to prevent refresh
      window.location.href = redirectUrl;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const refreshAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const { user: serverUser } = await response.json();
        console.log('refreshAuth success - setting user:', serverUser);
        setUser(serverUser);
        localStorage.setItem('user', JSON.stringify(serverUser));
        return serverUser;
      } else {
        console.log('refreshAuth failed - response not ok:', response.status);
        localStorage.removeItem('user');
        setUser(null);
        return null;
      }
    } catch (error) {
      console.log('refreshAuth error:', error);
      localStorage.removeItem('user');
      setUser(null);
      return null;
    }
  };

  const logout = () => {
    // Prevent multiple logout requests
    if (logoutMutation.isPending) {
      console.log('Logout already in progress, ignoring request');
      return;
    }
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
  };
}