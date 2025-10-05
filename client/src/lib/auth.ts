import { AuthUser } from '../types';

const AUTH_STORAGE_KEY = 'domainexchange_auth';

export const authStorage = {
  getUser: (): AuthUser | null => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },
  
  setUser: (user: AuthUser) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },
  
  removeUser: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
