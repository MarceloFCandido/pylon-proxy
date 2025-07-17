// Storage utility for managing API key and other data with type safety
export class Storage {
  private readonly API_KEY: string = 'pylon_api_key';
  private readonly TEAM_KEY: string = 'pylon_team';
  private readonly USER_KEY: string = 'pylon_user';

  // Clear API key from localStorage
  clearApiKey(): void {
    localStorage.removeItem(this.API_KEY);
  }

  // Get API key from localStorage
  getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY);
  }

  getTeam(): string | null {
    return localStorage.getItem(this.TEAM_KEY);
  }

  getUser(): string | null {
    return localStorage.getItem(this.USER_KEY);
  }

  // Check if API key exists
  hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  // Save API key to localStorage
  saveApiKey(key: string): boolean {
    if (key && key.trim()) {
      localStorage.setItem(this.API_KEY, key.trim());
      return true;
    }
    return false;
  }

  saveTeam(team: string): boolean {
    if (team) {
      localStorage.setItem(this.TEAM_KEY, team);
      return true;
    }
    return false;
  }

  saveUser(user: string): boolean {
    if (user) {
      localStorage.setItem(this.USER_KEY, user);
      return true;
    }
    return false;
  }
}
