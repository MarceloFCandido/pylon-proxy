// API Data Types
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Account {
  id: string;
  name: string;
  type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'closed' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: User;
  reporter?: User;
  team?: Team;
  created_at: string;
  updated_at: string;
  labels?: string[];
  comments_count?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
