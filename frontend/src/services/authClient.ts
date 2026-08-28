import { apiClient } from './apiClient';

export interface UserContext {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  organization: {
    id: string;
    name: string;
  } | null;
}

export const authClient = {
  async getMe(): Promise<UserContext> {
    if (import.meta.env.VITE_DATA_MODE === 'demo') {
      return {
        id: 'demo-user',
        username: 'Demo User',
        email: 'demo@example.com',
        roles: ['Admin'],
        permissions: ['read_all', 'write_all'],
        organization: { id: 'demo-org', name: 'Demo Org' }
      };
    }
    return apiClient.get('/api/auth/me/');
  }
};
