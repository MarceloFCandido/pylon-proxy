// Issues page component for viewing issues waiting on users with TypeScript
import { ApiClient } from '../api';
import { Storage } from '../storage';
import { PageComponent, User, Team, Issue } from '@/types';

interface IssueWithDetails extends Issue {
  account: {
    id: string;
    name: string;
    vip?: boolean;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  last_update_time: string;
}

export default class IssuesPage implements PageComponent {
  private storage: Storage;
  private apiClient: ApiClient;
  private selectedUserId: string | null;
  private selectedTeamId: string | null;
  private users: User[];
  private teams: Team[];
  private issues: IssueWithDetails[];
  private hasPendingChanges: boolean;

  constructor(storage: Storage) {
    this.storage = storage;
    this.apiClient = new ApiClient(storage);
    this.selectedUserId = null;
    this.selectedTeamId = null;
    this.users = [];
    this.teams = [];
    this.issues = [];
    this.hasPendingChanges = false;
  }

  render(): string {
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

            <!-- Refresh Button (Mobile-optimized) -->
            <div class="refresh-controls mt-2 flex justify-center">
              <button 
                id="refresh-issues-btn" 
                class="btn btn-primary w-full sm:w-auto" 
                aria-label="Refresh issues list"
                disabled>
                <span>Refresh Issues</span>
              </button>
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
                Select a user and/or a team to view issues
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Initialize data and event listeners
  async setupEventListeners(): Promise<void> {
    // Get last selection from storage
    this.selectedUserId = this.storage.getUser();
    this.selectedTeamId = this.storage.getTeam();

    await this.loadInitialData();

    // Set up refresh button click handler
    const refreshBtn = document.getElementById('refresh-issues-btn') as HTMLButtonElement | null;
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.hasPendingChanges = false;
        this.updateRefreshButtonState();
        this.checkAndLoadIssues();
      });
    }

    // Update button state based on loaded selections
    this.updateRefreshButtonState();

    // Trigger issue loading if there are saved selections
    if (this.selectedUserId || this.selectedTeamId) {
      this.checkAndLoadIssues();
    }
  }

  // Load users and teams
  private async loadInitialData(): Promise<void> {
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
      this.handleApiError(error as Error);
    }
  }

  // Render user select dropdown
  private renderUserSelect(): void {
    const container = document.getElementById('user-select-container');
    if (!container) return;

    container.innerHTML = `
      <select id="user-select" class="form-select">
        <option value="">Select a user</option>
        ${this.users.map(user => `
          <option value="${user.id}" ${this.selectedUserId === user.id ? 'selected' : ''}>
            ${user.name}
          </option>
        `).join('')}
      </select>
    `;

    // Add event listener
    const select = document.getElementById('user-select') as HTMLSelectElement | null;
    if (select) {
      select.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        this.selectedUserId = target.value || null;
        if (this.selectedUserId) {
          this.storage.saveUser(this.selectedUserId);
        }
        this.hasPendingChanges = true;
        this.updateRefreshButtonState();
      });
    }
  }

  // Render team select dropdown
  private renderTeamSelect(): void {
    const container = document.getElementById('team-select-container');
    if (!container) return;

    container.innerHTML = `
      <select id="team-select" class="form-select">
        <option value="">Select a team</option>
        ${this.teams.map(team => `
          <option value="${team.id}" ${this.selectedTeamId === team.id ? 'selected' : ''}>
            ${team.name}
          </option>
        `).join('')}
      </select>
    `;

    // Add event listener
    const select = document.getElementById('team-select') as HTMLSelectElement | null;
    if (select) {
      select.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        this.selectedTeamId = target.value || null;
        if (this.selectedTeamId) {
          this.storage.saveTeam(this.selectedTeamId);
        }
        this.hasPendingChanges = true;
        this.updateRefreshButtonState();
      });
    }
  }

  // Update the refresh button state based on selections
  private updateRefreshButtonState(): void {
    const btn = document.getElementById('refresh-issues-btn') as HTMLButtonElement | null;
    if (btn) {
      const hasSelection = !!(this.selectedUserId || this.selectedTeamId);
      btn.disabled = !hasSelection;
      
      // Add pending changes animation if enabled and has changes
      if (hasSelection && this.hasPendingChanges) {
        btn.classList.add('btn-pending');
      } else {
        btn.classList.remove('btn-pending');
      }
    }
  }

  // Check if both selections are made and load issues
  private async checkAndLoadIssues(): Promise<void> {
    if (this.selectedUserId || this.selectedTeamId) {
      await this.loadIssues();
    } else {
      // Show empty state if not any selected
      this.renderEmptyState();
    }
  }

  // Load issues for selected user and team
  private async loadIssues(): Promise<void> {
    const container = document.getElementById('issues-container');
    if (!container) return;

    // Show loading state
    container.innerHTML = this.renderLoadingSkeletons();

    try {
      const issues = await this.apiClient.getIssuesWaitingOnUser(
        this.selectedUserId || undefined,
        this.selectedTeamId || undefined
      );

      this.issues = issues as IssueWithDetails[];
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
  private renderLoadingSkeletons(): string {
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
  private renderIssues(): void {
    const container = document.getElementById('issues-container');
    if (!container) return;

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
  private renderEmptyState(): void {
    const container = document.getElementById('issues-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p class="text-secondary">
            Select both a user and/or a team to view issues
          </p>
        </div>
      `;
    }
  }

  // Format relative time
  private formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
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
  private handleApiError(error: Error): void {
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

      if (userContainer) userContainer.innerHTML = errorHtml;
      if (teamContainer) teamContainer.innerHTML = errorHtml;
    }
  }
}

// Auto-initialize event listeners when route changes
window.addEventListener('routechange', ((e: CustomEvent<{ path: string }>) => {
  if (e.detail.path === '/issues') {
    // Wait for DOM to be ready
    setTimeout(async () => {
      const { Storage } = await import('../storage');
      const storage = new Storage();
      const issuesPage = new IssuesPage(storage);
      await issuesPage.setupEventListeners();
    }, 100);
  }
}) as EventListener);
