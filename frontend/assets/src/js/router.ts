// Client-side router using History API with TypeScript
import { RouteHandler } from '@/types';

export class Router {
  private routes: Map<string, RouteHandler>;
  private contentElement: HTMLElement | null;

  constructor() {
    this.routes = new Map<string, RouteHandler>();
    this.contentElement = null;
  }

  // Add a route handler
  addRoute(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  // Initialize the router
  init(): void {
    // Get content element
    this.contentElement = document.getElementById('main-content');
    
    if (!this.contentElement) {
      console.error('Main content element not found');
      return;
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => this.handleRoute());

    // Handle initial route
    this.handleRoute();
  }

  // Navigate to a route
  navigate(path: string): void {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
      this.handleRoute();
    }
  }

  // Handle current route
  async handleRoute(): Promise<void> {
    if (!this.contentElement) return;

    const path = window.location.pathname;
    const handler = this.routes.get(path);

    if (handler) {
      // Update active navigation link
      this.updateActiveLink(path);

      // Clear content with fade out
      this.contentElement.style.opacity = '0';

      setTimeout(async () => {
        if (!this.contentElement) return;

        try {
          // Render new content
          const content = await handler();
          this.contentElement.innerHTML = content;

          // Fade in new content
          this.contentElement.style.opacity = '1';

          // Scroll to top
          window.scrollTo(0, 0);

          // Dispatch route change event
          window.dispatchEvent(new CustomEvent('routechange', { 
            detail: { path } 
          }));
        } catch (error) {
          console.error('Route handler error:', error);
          this.contentElement.innerHTML = this.renderError();
        }
      }, 150);
    } else {
      // Handle 404
      this.contentElement.innerHTML = this.render404();
    }
  }

  // Update active navigation link
  private updateActiveLink(path: string): void {
    const links = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
    links.forEach(link => {
      const linkPath = link.getAttribute('data-route');
      if (linkPath === path) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Render 404 page
  private render404(): string {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h2 class="empty-state-title">Page Not Found</h2>
        <p class="empty-state-description">
          The page you're looking for doesn't exist.
        </p>
        <div class="mt-4">
          <a href="/" class="btn btn-primary" data-route="/">
            Go Home
          </a>
        </div>
      </div>
    `;
  }

  // Render error page
  private renderError(): string {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h2 class="empty-state-title">Oops! Something went wrong</h2>
        <p class="empty-state-description">
          An error occurred while loading this page.
        </p>
        <div class="mt-4">
          <a href="/" class="btn btn-primary" data-route="/">
            Go Home
          </a>
        </div>
      </div>
    `;
  }
}
