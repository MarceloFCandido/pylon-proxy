// Issues page component for viewing issues waiting on users
import { ApiClient } from '../api.js';

export default class IssuesPage {
  constructor(storage) {
    this.storage = storage;
    this.apiClient = new ApiClient(storage);
    this.selectedUserId = null;
    this.selectedTeamId = null;
    this.users = [];
    this.teams = [];
    this.issues = [];
  }

  render() {
    return `
      <div class="container fade-in">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-lg font-semibold mb-2">Issues Waiting On You</h1>
          <p class="text-sm text-secondary">
            Select a user and team to view pending issues
          </p>
        </div>

        <!-- Selection Controls -->
        <div class="card mb-6">
          <div class="flex flex-col gap-4">
            <!-- User Selection -->
            <div class="form-group mb-0">
              <label for="user-select" class="form-label">User</label>
              <div id="user-select-container">
                <div class="skeleton skeleton-select"></div>
              </div>
            </div>

            <!-- Team Selection -->
            <div class="form-group mb-0">
              <label for="team-select" class="form-label">Team</label>
              <div id="team-select-container">
                <div class="skeleton skeleton-select"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Issues Section -->
        <div id="issues-section">
          <h2 class="font-semibold mb-4">On You</h2>
          <div id="issues-container">
            <div class="empty-state">
              <div class="empty-state-icon">📋</div>
              <p class="text-secondary">
                Select both a user and team to view issues
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Initialize data and event listeners
  async setupEventListeners() {
    await this.loadInitialData();
  }

  // Load users and teams
  async loadInitialData() {
    try {
      // Load users and teams in parallel
      const [users, teams] = await Promise.all([
        this.apiClient.getUsers(),
        this.apiClient.getTeams()
      ]);

      this.users = users;
      this.teams = teams;

      // Render the select elements
      this.renderUserSelect();
      this.renderTeamSelect();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.handleApiError(error);
    }
  }

  // Render user select dropdown
  renderUserSelect() {
    const container = document.getElementById('user-select-container');
    container.innerHTML = `
      <select id="user-select" class="form-select">
        <option value="">Select a user</option>
        ${this.users.map(user => `
          <option value="${user.id}">${user.name}</option>
        `).join('')}
      </select>
    `;

    // Add event listener
    const select = document.getElementById('user-select');
    select.addEventListener('change', (e) => {
      this.selectedUserId = e.target.value;
      this.checkAndLoadIssues();
    });
  }

  // Render team select dropdown
  renderTeamSelect() {
    const container = document.getElementById('team-select-container');
    container.innerHTML = `
      <select id="team-select" class="form-select">
        <option value="">Select a team</option>
        ${this.teams.map(team => `
          <option value="${team.id}">${team.name}</option>
        `).join('')}
      </select>
    `;

    // Add event listener
    const select = document.getElementById('team-select');
    select.addEventListener('change', (e) => {
      this.selectedTeamId = e.target.value;
      this.checkAndLoadIssues();
    });
  }

  // Check if both selections are made and load issues
  async checkAndLoadIssues() {
    if (this.selectedUserId || this.selectedTeamId) {
      await this.loadIssues();
    } else {
      // Show empty state if not both selected
      this.renderEmptyState();
    }
  }

  // Load issues for selected user and team
  async loadIssues() {
    const container = document.getElementById('issues-container');

    // Show loading state
    container.innerHTML = this.renderLoadingSkeletons();

    try {
      const issues = await this.apiClient.getIssuesWaitingOnUser(
        this.selectedUserId,
        this.selectedTeamId
      );

      this.issues = issues;
      this.renderIssues();
    } catch (error) {
      console.error('Failed to load issues:', error);
      container.innerHTML = `
        <div class="alert alert-error">
          Failed to load issues. Please try again.
        </div>
      `;
    }
  }

  // Render loading skeletons
  renderLoadingSkeletons() {
    return Array(3).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="flex justify-between mb-3">
          <div class="skeleton skeleton-text" style="width: 150px;"></div>
          <div class="skeleton skeleton-text" style="width: 80px;"></div>
        </div>
        <div class="flex justify-between">
          <div class="skeleton skeleton-text" style="width: 100px;"></div>
          <div class="skeleton skeleton-text" style="width: 120px;"></div>
        </div>
      </div>
    `).join('');
  }

  // Render issues list
  renderIssues() {
    const container = document.getElementById('issues-container');

    if (this.issues.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎉</div>
          <h3 class="empty-state-title">No Issues Waiting</h3>
          <p class="empty-state-description">
            Great job! There are no issues waiting on you.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.issues.map(issue => `
      <div class="issue-card">
        <div class="issue-header">
          <div class="issue-account">
            <span class="issue-account-name">${issue.account.name}</span>
            ${issue.account.vip ? '<span class="vip-badge">VIP</span>' : ''}
          </div>
          <span class="issue-id">#${issue.id}</span>
        </div>
        <div class="issue-title">
        ${issue.title}
        </div>
        <div class="issue-footer">
          <span class="issue-priority priority-${issue.priority.toLowerCase()}">
            ${issue.priority}
          </span>
          <span class="issue-time">
            ${this.formatRelativeTime(issue.last_update_time)}
          </span>
        </div>
      </div>
    `).join('');
  }

  // Render empty state
  renderEmptyState() {
    const container = document.getElementById('issues-container');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p class="text-secondary">
          Select both a user and team to view issues
        </p>
      </div>
    `;
  }

  // Format relative time
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  // Handle API errors
  handleApiError(error) {
    if (error.message === 'Invalid API key') {
      // Redirect to home page to re-enter API key
      window.location.href = '/';
    } else {
      // Show error in both select containers
      const userContainer = document.getElementById('user-select-container');
      const teamContainer = document.getElementById('team-select-container');

      const errorHtml = `
        <div class="alert alert-error">
          Failed to load data. Please refresh the page.
        </div>
      `;

      userContainer.innerHTML = errorHtml;
      teamContainer.innerHTML = errorHtml;
    }
  }
}

// Auto-initialize event listeners when route changes
window.addEventListener('routechange', (e) => {
  if (e.detail.path === '/issues') {
    // Wait for DOM to be ready
    setTimeout(async () => {
      const { Storage } = await import('../storage.js');
      const storage = new Storage();
      const issuesPage = new IssuesPage(storage);
      await issuesPage.setupEventListeners();
    }, 100);
  }
});
