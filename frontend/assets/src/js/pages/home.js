// Home page component for API key management
import { ApiClient } from '../api.js';

export default class HomePage {
  constructor(storage) {
    this.storage = storage;
    this.apiClient = new ApiClient(storage);
  }

  render() {
    const existingKey = this.storage.getApiKey();

    return `
      <div class="container fade-in">
        <div class="card" style="max-width: 500px; margin: 2rem auto;">
          <h1 class="card-title">Welcome to Pylon Proxy</h1>
          <p class="card-description">
            Enter your Pylon API key to access issue tracking on mobile.
            ${existingKey ? 'You can update your existing key below.' : ''}
          </p>

          <form id="api-key-form" class="mt-6">
            <div class="form-group">
              <label for="api-key-input" class="form-label">
                Pylon API Key
              </label>
              <input
                type="password"
                id="api-key-input"
                class="form-input"
                placeholder="Enter your API key"
                value="${existingKey ? '••••••••••••••••' : ''}"
                autocomplete="off"
              />
            </div>

            <div id="message-container"></div>

            <div class="btn-group">
              <button type="submit" class="btn btn-primary" id="submit-btn">
                ${existingKey ? 'Update' : 'Submit'}
              </button>
              ${existingKey ? `
                <button type="button" class="btn btn-danger" id="clear-btn">
                  Clear
                </button>
              ` : ''}
            </div>
          </form>

          ${existingKey ? `
            <div class="mt-6" style="text-align: center;">
              <a href="/issues" class="btn btn-secondary" data-route="/issues">
                Go to Issues →
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Initialize event listeners after render
  setupEventListeners() {
    const form = document.getElementById('api-key-form');
    const clearBtn = document.getElementById('clear-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const messageContainer = document.getElementById('message-container');

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    });

    // Handle clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.handleClear());
    }

    // Clear placeholder when user starts typing
    apiKeyInput.addEventListener('focus', () => {
      if (this.storage.getApiKey() && apiKeyInput.value === '••••••••••••••••') {
        apiKeyInput.value = '';
      }
    });

    // Restore placeholder if empty
    apiKeyInput.addEventListener('blur', () => {
      if (this.storage.getApiKey() && apiKeyInput.value === '') {
        apiKeyInput.value = '••••••••••••••••';
      }
    });
  }

  async handleSubmit(e) {
    // Make sure we have the event
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const apiKeyInput = document.getElementById('api-key-input');
    const submitBtn = document.getElementById('submit-btn');
    const messageContainer = document.getElementById('message-container');

    const apiKey = apiKeyInput.value.trim();

    // Skip if placeholder
    if (apiKey === '••••••••••••••••' || !apiKey) {
      this.showMessage('Please enter an API key', 'warning');
      return;
    }

    // Disable form during validation
    apiKeyInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Validating...';
    messageContainer.innerHTML = '';

    try {
      // Test the API key
      const isValid = await this.apiClient.testApiKey(apiKey);

      if (isValid) {
        // Save the key
        this.storage.saveApiKey(apiKey);
        this.showMessage('API key saved successfully!', 'success');

        // Redirect to issues page after a short delay
        setTimeout(() => {
          console.log('Attempting navigation to /issues');

          // Try multiple navigation methods
          if (window.appRouter && typeof window.appRouter.navigate === 'function') {
            console.log('Using app router');
            window.appRouter.navigate('/issues');
          } else {
            console.log('App router not available, trying direct click');
            // Try clicking the issues link as absolute fallback
            const issuesLink = document.querySelector('a[href="/issues"]');
            if (issuesLink) {
              console.log('Found issues link, clicking it');
              issuesLink.click();
            } else {
              console.error('No navigation method available');
            }
          }
        }, 1000);
      } else {
        this.showMessage('Invalid API key. Please check and try again.', 'error');
      }
    } catch (error) {
      console.error('API validation error:', error);
      this.showMessage('Failed to validate API key. Please try again.', 'error');
    } finally {
      // Re-enable form
      apiKeyInput.disabled = false;
      submitBtn.disabled = false;
      submitBtn.textContent = this.storage.getApiKey() ? 'Update' : 'Submit';
    }
  }

  handleClear() {
    const messageContainer = document.getElementById('message-container');

    // Clear the API key
    this.storage.clearApiKey();
    this.showMessage('API key cleared successfully!', 'success');

    // Navigate back to home to refresh the UI after a short delay
    setTimeout(() => {
      // Use the global router for client-side navigation
      if (window.appRouter) {
        window.appRouter.navigate('/');
      }
    }, 1000);
  }

  showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `
      <div class="alert alert-${type}">
        ${message}
      </div>
    `;
  }
}

// Auto-initialize event listeners when route changes
window.addEventListener('routechange', (e) => {
  if (e.detail.path === '/') {
    // Wait for DOM to be ready
    setTimeout(async () => {
      const { Storage } = await import('../storage.js');
      const storage = new Storage();
      const homePage = new HomePage(storage);
      homePage.setupEventListeners();
    }, 100);
  }
});
