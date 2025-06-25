// Main entry point for the Pylon Proxy application
import { Router } from './router.js';
import { Storage } from './storage.js';
import HomePage from './pages/home.js';
import IssuesPage from './pages/issues.js';

// Make router globally accessible
window.appRouter = null;

// Initialize the application
class App {
  constructor() {
    this.router = new Router();
    this.storage = new Storage();

    // Make router globally accessible
    window.appRouter = this.router;

    this.initializeTheme();
    this.setupRoutes();
    this.setupEventListeners();
  }

  // Initialize theme from localStorage or system preference
  initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;

    document.documentElement.setAttribute('data-theme', theme);
  }

  // Setup application routes
  setupRoutes() {
    // Home route
    this.router.addRoute('/', () => {
      const homePage = new HomePage(this.storage);
      return homePage.render();
    });

    // Issues route
    this.router.addRoute('/issues', () => {
      // Check if API key exists
      if (!this.storage.getApiKey()) {
        // Redirect to home if no API key
        this.router.navigate('/');
        return '';
      }

      const issuesPage = new IssuesPage(this.storage);
      return issuesPage.render();
    });

    // Start the router
    this.router.init();
  }

  // Setup global event listeners
  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', () => this.toggleTheme());

    // Navigation link handling
    document.addEventListener('click', (e) => {
      // Handle navigation links
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        this.router.navigate(route);
      }
    });

    // Handle custom navigation events (fallback for programmatic navigation)
    window.addEventListener('app-navigate', (e) => {
      if (e.detail && e.detail.path) {
        this.router.navigate(e.detail.path);
      }
    });
  }

  // Toggle between light and dark theme
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Add transitioning class
    document.body.classList.add('theme-transitioning');

    // Change theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Remove transitioning class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
