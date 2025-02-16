import DOMPurify from 'dompurify';

const SANITIZE_CONFIG = Object.freeze({
  ALLOWED_TAGS: [
    'div', 'button', 'span', 'p', 'h2', 'nav', 
    'label', 'input', 'a', 'img', 'table', 'tr', 'td', 'th'
  ],
  ALLOWED_ATTR: [
    'class', 'id', 'type', 'checked', 'disabled', 
    'data-tab', 'data-category', 'aria-label', 'src', 'alt', 'href',
    'role', 'aria-selected', 'aria-controls', 'tabindex',
    'aria-expanded', 'aria-hidden'
  ],
  ALLOW_DATA_ATTR: false,
  RETURN_DOM: false,
  USE_PROFILES: { html: true },
  SANITIZE_DOM: true,
  WHOLE_DOCUMENT: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
});

export const createSafeElement = (tagName) => {
  if (typeof tagName !== 'string' || !SANITIZE_CONFIG.ALLOWED_TAGS.includes(tagName.toLowerCase())) {
    console.error(`Invalid tag name: ${tagName}`);
    return null;
  }
  return document.createElement(tagName);
};

export const createElement = (template) => {
  if (typeof template !== 'string') {
    console.error('Invalid template provided to createElement');
    return null;
  }
  // eslint-disable-next-line xss/no-mixed-html
  const preSanitized = template
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '');
  // eslint-disable-next-line xss/no-mixed-html
  const sanitized = DOMPurify.sanitize(preSanitized, SANITIZE_CONFIG);
  const wrapper = createSafeElement('div');
  if (!wrapper) return null;
  wrapper.innerHTML = sanitized;
  return wrapper.firstElementChild;
};

export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') {
    console.error('Invalid input provided to sanitizeHTML');
    return '';
  }
  // eslint-disable-next-line xss/no-mixed-html
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
};

const ALLOWED_DOMAINS = ['cdn.prod.website-files.com', 'herm.io'];

export const isValidURL = (url) => {
  try {
    if (typeof url !== 'string') return false;
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('#')) {
      return true;
    }
    const urlObject = new URL(url);
    return ALLOWED_DOMAINS.includes(urlObject.hostname);
  } catch {
    return false;
  }
};

const SAFE_SELECTOR_PATTERN = /^[.#]?[a-zA-Z0-9_-]+$|^\[data-[a-zA-Z0-9_-]+="[a-zA-Z0-9_-]+"\]$/;

export const safeQuerySelector = (selector) => {
  try {
    if (typeof selector !== 'string') return null;
    if (!SAFE_SELECTOR_PATTERN.test(selector)) {
      console.error('Invalid selector pattern');
      return null;
    }
    return document.querySelector(selector);
  } catch (error) {
    console.error('Error in safeQuerySelector:', error);
    return null;
  }
};

export const setSafeAttribute = (element, attr, value) => {
  if (!element || !attr || typeof attr !== 'string') return false;
  const allowedAttrs = new Set(SANITIZE_CONFIG.ALLOWED_ATTR);
  if (!allowedAttrs.has(attr)) {
    console.error(`Attribute not allowed: ${attr}`);
    return false;
  }
  try {
    const safeValue = DOMPurify.sanitize(String(value), { ALLOWED_TAGS: [] });
    element.setAttribute(attr, safeValue);
    return true;
  } catch (error) {
    console.error('Error in setSafeAttribute:', error);
    return false;
  }
};

export const toggleClass = (element, className, force) => {
  if (!element || typeof className !== 'string') return false;
  const safeClassName = /^[a-zA-Z0-9_-]+$/.test(className);
  if (!safeClassName) {
    console.error(`Invalid class name: ${className}`);
    return false;
  }
  try {
    element.classList.toggle(className, force);
    return true;
  } catch (error) {
    console.error('Error in toggleClass:', error);
    return false;
  }
};