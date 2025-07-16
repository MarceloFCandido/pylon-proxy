// API client for backend communication with TypeScript
import { User, Team, Issue, ApiError } from '@/types';
import { Storage } from './storage';

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

export class ApiClient {
  private storage: Storage;
  private baseUrl: string;

  constructor(storage: Storage) {
    this.storage = storage;
    this.baseUrl = '/api'; // Relative path, will be proxied by frontend server
  }

  // Make authenticated request
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const apiKey = this.storage.getApiKey();

    if (!apiKey) {
      throw new Error('No API key found');
    }

    const defaultOptions: RequestOptions = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions: RequestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, mergedOptions);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        throw new Error(`Request failed: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Test API key validity
  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('API key test error:', error);
      return false;
    }
  }

  // Get users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  // Get teams
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  // Get issues waiting on user
  async getIssuesWaitingOnUser(userId?: string, teamId?: string): Promise<Issue[]> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (teamId) params.append('team_id', teamId);

    const queryString = params.toString();
    const endpoint = `/waiting${queryString ? `?${queryString}` : ''}`;

    return this.request<Issue[]>(endpoint);
  }
}
