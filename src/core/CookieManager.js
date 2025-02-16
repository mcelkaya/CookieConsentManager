export class CookieManager {
  constructor(domain) {
    // Disable warning: domain is non-HTML data
    // eslint-disable-next-line xss/no-mixed-html
    this.domain = this.sanitizeDomain(domain);
  }

  sanitizeDomain(domain) {
    const sanitized = domain.trim().toLowerCase();
    return /^[a-z0-9.-]+$/i.test(sanitized)
      ? (sanitized.startsWith('.') ? sanitized : `.${sanitized}`)
      : null;
  }

  setCookie(name, value, days = 365) {
    if (!this.isValidCookieName(name) || !this.domain) return false;
    const sanitizedValue = encodeURIComponent(String(value));
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieOptions = [
      `${name}=${sanitizedValue}`,
      `expires=${date.toUTCString()}`,
      'path=/',
      `domain=${this.domain}`,
      'SameSite=Lax',
      'Secure'
    ];
    try {
      document.cookie = cookieOptions.join(';');
      return true;
    } catch (error) {
      console.error('Failed to set cookie:', error);
      return false;
    }
  }

  getCookie(name) {
    if (!this.isValidCookieName(name)) return null;
    try {
      const cookies = document.cookie.split(';');
      const nameEQ = `${name}=`;
      for (const cookie of cookies) {
        const c = cookie.trim();
        if (c.startsWith(nameEQ)) {
          const value = c.substring(nameEQ.length);
          return decodeURIComponent(value);
        }
      }
    } catch (error) {
      console.error('Failed to get cookie:', error);
    }
    return null;
  }

  deleteCookie(name) {
    if (!this.isValidCookieName(name)) return false;
    try {
      const cookieOptions = [
        `${name}=`,
        'expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'path=/',
        `domain=${this.domain}`,
        'SameSite=Lax',
        'Secure'
      ];
      document.cookie = cookieOptions.join(';');
      return true;
    } catch (error) {
      console.error('Failed to delete cookie:', error);
      return false;
    }
  }

  isValidCookieName(name) {
    return typeof name === 'string' && /^[a-z0-9_-]+$/i.test(name) && name.length <= 64;
  }
}