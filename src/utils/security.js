import DOMPurify from 'dompurify';
import { safeObjectAccess, safeObjectEntries } from './safeObjectAccess';

const SECURITY_CONFIG = Object.freeze({
  CSP_DIRECTIVES: Object.freeze({
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://cdn.prod.website-files.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'https://cdn.prod.website-files.com', 'data:'],
    'connect-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"]
  }),
  ALLOWED_DOMAINS: Object.freeze([
    'cdn.prod.website-files.com',
    'herm.io'
  ]),
  PATTERNS: Object.freeze({
    URL: /^https:\/\/([a-zA-Z0-9-]+\.)*herm\.io/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    COOKIE_NAME: /^[a-z0-9_-]+$/i,
    DOMAIN: /^[a-z0-9.-]+$/i
  })
});

/**
 * Generate a secure nonce
 */
const generateSecureNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Helper function to format a single CSP directive.
 *
 * For the 'script-src' directive, if the URL includes ?debugCSP=true,
 * the function will add the 'unsafe-inline' keyword so that inline scripts are allowed.
 */
const formatDirective = (key, values, nonce) => {
  let finalValues = values;
  if (key === 'script-src') {
    // Always add the nonce.
    finalValues = [...values, `'nonce-${nonce}'`];
    // If the URL contains debugCSP=true, allow inline scripts.
    if (document.location.search.indexOf('debugCSP=true') > -1) {
      finalValues.push("'unsafe-inline'");
    }
  }
  return `${key} ${finalValues.join(' ')}`;
};

/**
 * Construct CSP directives using the helper.
 */
const constructCSPDirectives = (nonce) => {
  const directives = safeObjectEntries(SECURITY_CONFIG.CSP_DIRECTIVES)
    .map(([key, values]) => formatDirective(key, values, nonce))
    .filter(Boolean)
    .join('; ');
  return `${directives}; upgrade-insecure-requests`;
};

/**
 * Set up Content Security Policy
 */
export const setupCSP = () => {
  try {
    const nonce = generateSecureNonce();
    const cspDirectives = constructCSPDirectives(nonce);
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspDirectives;
    document.head.appendChild(meta);
    
    console.log("Security: CSP meta tag added:", meta.content);
    return nonce;
  } catch (error) {
    console.error('Error setting up CSP:', error);
    return null;
  }
};

/**
 * Validate a URL
 */
export const isValidUrl = (url) => {
  try {
    if (typeof url !== 'string') return false;
    const urlObject = new URL(url);
    return SECURITY_CONFIG.ALLOWED_DOMAINS.includes(urlObject.hostname);
  } catch {
    return false;
  }
};

/**
 * Helper function to validate a single rule for a given value.
 */
const validateRule = (value, rules) => {
  if (rules.required && value == null) return false;
  if (!rules.required && value == null) return true;
  if (rules.type && typeof value !== rules.type) return false;
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) return false;
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) return false;
    if (rules.maxLength && value.length > rules.maxLength) return false;
  }
  if (typeof value === 'number') {
    if (rules.min && value < rules.min) return false;
    if (rules.max && value > rules.max) return false;
  }
  return true;
};

/**
 * Validate data structure against schema.
 */
const validateDataStructure = (data, schema) => {
  return Object.entries(schema).every(([key, rules]) => validateRule(data[key], rules));
};

/**
 * Validate data against a schema
 */
export const validateData = (data, schema) => {
  if (!data || !schema || typeof schema !== 'object') return false;
  try {
    return validateDataStructure(data, schema);
  } catch (error) {
    console.error('Data validation error:', error);
    return false;
  }
};

/**
 * Rate limiter class
 */
export class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    this.cleanupOldRequests(now);
    return this.checkAndUpdateRequests(key, now);
  }

  cleanupOldRequests(now) {
    const windowStart = now - this.timeWindow;
    for (const [key, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(time => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }

  checkAndUpdateRequests(key, now) {
    const requestTimes = this.requests.get(key) || [];
    const recentRequests = requestTimes.filter(time => time > now - this.timeWindow);
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}

/**
 * Add security headers (Note: These meta tags must be delivered via HTTP headers for full protection,
 * but are added here as a fallback).
 */
export const addSecurityHeaders = () => {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };

  Object.entries(headers).forEach(([header, value]) => {
    const meta = document.createElement('meta');
    meta.httpEquiv = header;
    meta.content = value;
    document.head.appendChild(meta);
  });
};

/**
 * Security logging
 */
export const securityLog = (event, data = {}) => {
  const sanitizedEvent = DOMPurify.sanitize(event);
  const sanitizedData = JSON.parse(JSON.stringify(data));
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: sanitizedEvent,
    data: sanitizedData,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  if (process.env.NODE_ENV !== 'production') {
    console.warn('Security Event:', logEntry);
  }

  return logEntry;
};