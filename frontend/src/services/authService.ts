import api from '../lib/api';
import { LoginCredentials, AuthResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  }
};