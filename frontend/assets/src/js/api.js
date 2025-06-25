// API client for backend communication
export class ApiClient {
  constructor(storage) {
    this.storage = storage;
    this.baseUrl = '/api'; // Relative path, will be proxied by frontend server
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const apiKey = this.storage.getApiKey();

    if (!apiKey) {
      throw new Error('No API key found');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions = {
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

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Test API key validity
  async testApiKey(apiKey) {
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
  async getUsers() {
    return this.request('/users');
  }

  // Get teams
  async getTeams() {
    return this.request('/teams');
  }

  // Get issues waiting on user
  async getIssuesWaitingOnUser(userId, teamId) {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (teamId) params.append('team_id', teamId);

    const queryString = params.toString();
    const endpoint = `/waiting${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }
}
