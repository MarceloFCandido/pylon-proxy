// Global type declarations for the application
import { Router } from '@/js/router';

declare global {
  interface Window {
    appRouter: Router | null;
  }
}

// This is required for the file to be treated as a module
export {};
