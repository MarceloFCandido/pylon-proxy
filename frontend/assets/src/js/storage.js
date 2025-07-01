// Storage utility for managing API key and other data
export class Storage {
  constructor() {
    this.API_KEY = 'pylon_api_key';
    this.TEAM_KEY = 'pylon_team';
    this.USER_KEY = 'pylon_user';
  }

  // Clear API key from localStorage
  clearApiKey() {
    localStorage.removeItem(this.API_KEY);
  }

  // Get API key from localStorage
  getApiKey() {
    return localStorage.getItem(this.API_KEY);
  }

  getTeam() {
    return localStorage.getItem(this.TEAM_KEY);
  }

  getUser() {
    return localStorage.getItem(this.USER_KEY);
  }

  // Check if API key exists
  hasApiKey() {
    return !!this.getApiKey();
  }

  // Save API key to localStorage
  saveApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem(this.API_KEY, key.trim());
      return true;
    }
    return false;
  }

  saveTeam(team) {
    if (team) {
      localStorage.setItem(this.TEAM_KEY, team);
      return true;
    }
    return false;
  }

  saveUser(user) {
    if (user) {
      localStorage.setItem(this.USER_KEY, user);
      return true;
    }
    return false;
  }
}
