// Storage utility for managing API key and other data
export class Storage {
  constructor() {
    this.API_KEY = 'pylon_api_key';
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
    return localStorage.getItem('pylon_team');
  }

  getUser() {
    return localStorage.getItem('pylon_user');
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
      localStorage.setItem('pylon_team', team);
      return true;
    }
    return false;
  }

  saveUser(user) {
    if (user) {
      localStorage.setItem('pylon_user', user);
      return true;
    }
    return false;
  }
}
