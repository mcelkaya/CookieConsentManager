// constants.js

// Core constants
export const COOKIE_NAME = 'herm_cookie_consent';
export const STORAGE_KEY = 'herm_cookie_preferences';
export const DOMAIN = '.herm.io';
export const VERSION = '1.0.0';

// Cookie types
export const COOKIE_TYPES = {
  NECESSARY: 'necessary',
  PREFERENCES: 'preferences',
  STATISTICS: 'statistics',
  MARKETING: 'marketing'
};

// Tab IDs
export const TAB_IDS = {
  CONSENT: 'consent',
  DETAILS: 'details',
  ABOUT: 'about'
};

// Default preferences
export const DEFAULT_PREFERENCES = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
  timestamp: null
};

// Security constants
export const SECURITY = {
  // CSP directives
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.prod.website-files.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'https://cdn.prod.website-files.com', 'data:'],
    'connect-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"]
  },

  // Allowed domains for external resources
  ALLOWED_DOMAINS: [
    'cdn.prod.website-files.com',
    'herm.io'
  ],

  // Rate limiting
  RATE_LIMIT: {
    DEFAULT_DELAY: 100,
    EXTENDED_DELAY: 1000
  },

  // Cookie security options
  COOKIE_OPTIONS: {
    SAME_SITE: 'Lax',
    SECURE: true,
    HTTP_ONLY: true,
    MAX_AGE: 365 * 24 * 60 * 60, // 1 year in seconds
    PATH: '/'
  },

  // Validation patterns
  PATTERNS: {
    COOKIE_NAME: /^[a-z0-9_-]+$/i,
    DOMAIN: /^[a-z0-9.-]+$/i,
    LANGUAGE: /^[a-z]{2}$/i
  },

  // Size limits
  LIMITS: {
    MAX_COOKIE_NAME_LENGTH: 64,
    MAX_COOKIE_VALUE_LENGTH: 4096,
    MAX_STORAGE_KEY_LENGTH: 64,
    MAX_STORAGE_VALUE_LENGTH: 1048576 // 1MB
  }
};

// Accessibility constants
export const ACCESSIBILITY = {
  ROLES: {
    DIALOG: 'dialog',
    TAB: 'tab',
    TABLIST: 'tablist',
    TABPANEL: 'tabpanel',
    BUTTON: 'button'
  },
  
  LABELS: {
    COOKIE_PREFERENCES: 'Cookie Preferences',
    CLOSE_MODAL: 'Close Cookie Preferences',
    TOGGLE_SECTION: 'Toggle section'
  }
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CONFIG: 'Invalid configuration provided',
  STORAGE_ERROR: 'Failed to access local storage',
  COOKIE_ERROR: 'Failed to set cookie',
  INITIALIZATION_ERROR: 'Failed to initialize consent manager',
  VALIDATION_ERROR: 'Invalid data provided',
  SECURITY_ERROR: 'Security violation detected'
};

// Event names
export const EVENTS = {
  PREFERENCES_SAVED: 'preferences_saved',
  PREFERENCES_DENIED: 'preferences_denied',
  PREFERENCES_ACCEPTED: 'preferences_accepted',
  TAB_CHANGED: 'tab_changed',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  ERROR_OCCURRED: 'error_occurred'
};