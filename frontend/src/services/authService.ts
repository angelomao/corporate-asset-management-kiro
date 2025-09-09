import api from '../lib/api';
import { LoginCredentials, AuthResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/users/me');
    return response.data;
  }
};