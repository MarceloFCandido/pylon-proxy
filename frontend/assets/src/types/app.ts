// Application Types
export interface RouteHandler {
  (): string | Promise<string>;
}

export interface Route {
  path: string;
  handler: RouteHandler;
  exact?: boolean;
}

export interface RouterConfig {
  mode?: 'hash' | 'history';
  root?: string;
}

// Storage Types
export interface StorageData {
  apiKey?: string;
  theme?: 'light' | 'dark';
  selectedUser?: string;
  selectedTeam?: string;
  preferences?: Record<string, any>;
}

// Page Component Interface
export interface PageComponent {
  render(): string | Promise<string>;
  destroy?(): void;
}