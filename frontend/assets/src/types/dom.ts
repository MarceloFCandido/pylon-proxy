// DOM Type Helpers
export type Nullable<T> = T | null;

// Form Elements
export interface FormElements {
  apiKeyInput: HTMLInputElement | null;
  userSelect: HTMLSelectElement | null;
  teamSelect: HTMLSelectElement | null;
  submitButton: HTMLButtonElement | null;
}

// Event Handler Types
export type ClickHandler = (event: MouseEvent) => void;
export type SubmitHandler = (event: Event) => void;
export type ChangeHandler = (event: Event) => void;

// Navigation Types
export interface NavLink {
  path: string;
  label: string;
  active?: boolean;
}

// Theme Types
export type Theme = 'light' | 'dark';

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};