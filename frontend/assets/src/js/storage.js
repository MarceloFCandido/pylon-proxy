// Storage utility for managing API key and other data
export class Storage {
  constructor() {
    this.API_KEY = 'pylon_api_key';
  }

  // Save API key to localStorage
  saveApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem(this.API_KEY, key.trim());
      return true;
    }
    return false;
  }

  // Get API key from localStorage
  getApiKey() {
    return localStorage.getItem(this.API_KEY);
  }

  // Clear API key from localStorage
  clearApiKey() {
    localStorage.removeItem(this.API_KEY);
  }

  // Check if API key exists
  hasApiKey() {
    return !!this.getApiKey();
  }
}
