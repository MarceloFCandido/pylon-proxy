// Main entry point for the Pylon Proxy application with TypeScript
import { Router } from './router';
import { Storage } from './storage';
import HomePage from './pages/home';
import IssuesPage from './pages/issues';
import { Theme } from '@/types';

// Import CSS files for webpack bundling
import '../styles/main.css';
import '../styles/themes.css';
import '../styles/components.css';

// Make router globally accessible
window.appRouter = null;

// Initialize the application
class App {
  private router: Router;
  private storage: Storage;

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
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;

    document.documentElement.setAttribute('data-theme', theme);
  }

  // Setup application routes
  private setupRoutes(): void {
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
  private setupEventListeners(): void {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle') as HTMLButtonElement | null;
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Navigation link handling
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle navigation links
      if (target.matches('[data-route]')) {
        e.preventDefault();
        const route = target.getAttribute('data-route');
        if (route) {
          this.router.navigate(route);
        }
      }
    });

    // Handle custom navigation events (fallback for programmatic navigation)
    window.addEventListener('app-navigate', ((e: CustomEvent<{ path: string }>) => {
      if (e.detail && e.detail.path) {
        this.router.navigate(e.detail.path);
      }
    }) as EventListener);
  }

  // Toggle between light and dark theme
  private toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme') as Theme;
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';

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
