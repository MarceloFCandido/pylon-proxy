// Client-side router using History API
export class Router {
  constructor() {
    this.routes = new Map();
    this.contentElement = null;
  }

  // Add a route handler
  addRoute(path, handler) {
    this.routes.set(path, handler);
  }

  // Initialize the router
  init() {
    // Get content element
    this.contentElement = document.getElementById('main-content');

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => this.handleRoute());

    // Handle initial route
    this.handleRoute();
  }

  // Navigate to a route
  navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
      this.handleRoute();
    }
  }

  // Handle current route
  handleRoute() {
    const path = window.location.pathname;
    const handler = this.routes.get(path);

    if (handler) {
      // Update active navigation link
      this.updateActiveLink(path);

      // Clear content with fade out
      this.contentElement.style.opacity = '0';

      setTimeout(() => {
        // Render new content
        const content = handler();
        this.contentElement.innerHTML = content;

        // Fade in new content
        this.contentElement.style.opacity = '1';

        // Scroll to top
        window.scrollTo(0, 0);

        // Dispatch route change event
        window.dispatchEvent(new CustomEvent('routechange', { detail: { path } }));
      }, 150);
    } else {
      // Handle 404
      this.contentElement.innerHTML = this.render404();
    }
  }

  // Update active navigation link
  updateActiveLink(path) {
    const links = document.querySelectorAll('.nav-link');
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
  render404() {
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
}
