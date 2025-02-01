class CookieConsentManager {
    constructor(options = {}) {
      this.domain = '.herm.io'; // Root domain for cross-subdomain support
      this.cookieName = 'herm_cookie_consent';
      this.localStorageKey = 'herm_cookie_preferences';
      this.necessaryCookies = options.necessaryCookies || [];
      this.marketingCookies = options.marketingCookies || [];
      this.analyticsCookies = options.analyticsCookies || [];
      
      // Initialize consent banner HTML
      this.initBanner();
      this.checkAndShowBanner();
    }
  
    initBanner() {
      const bannerHtml = `
        <div id="cookie-consent-banner" class="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
          <div class="max-w-6xl mx-auto">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="flex-1">
                <p class="text-gray-700">
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                </p>
              </div>
              <div class="flex gap-2">
                <button id="cookie-consent-customize" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
                  Customize
                </button>
                <button id="cookie-consent-accept" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded">
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <div id="cookie-preferences-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 class="text-xl font-bold mb-4">Cookie Preferences</h2>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold">Necessary</h3>
                  <p class="text-sm text-gray-600">Required for the website to function</p>
                </div>
                <input type="checkbox" checked disabled>
              </div>
  
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold">Analytics</h3>
                  <p class="text-sm text-gray-600">Help us improve our website</p>
                </div>
                <input type="checkbox" id="analytics-consent">
              </div>
  
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold">Marketing</h3>
                  <p class="text-sm text-gray-600">Personalized content and ads</p>
                </div>
                <input type="checkbox" id="marketing-consent">
              </div>
            </div>
  
            <div class="mt-6 flex justify-end gap-2">
              <button id="save-preferences" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      `;
  
      // Create and append banner to body
      const bannerContainer = document.createElement('div');
      bannerContainer.innerHTML = bannerHtml;
      document.body.appendChild(bannerContainer);
  
      // Add event listeners
      this.addEventListeners();
    }
  
    addEventListeners() {
      document.getElementById('cookie-consent-accept')?.addEventListener('click', () => {
        this.acceptAll();
        this.hideBanner();
      });
  
      document.getElementById('cookie-consent-customize')?.addEventListener('click', () => {
        this.showPreferencesModal();
      });
  
      document.getElementById('save-preferences')?.addEventListener('click', () => {
        this.savePreferences();
        this.hidePreferencesModal();
        this.hideBanner();
      });
    }
  
    setCookie(name, value, days = 365) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}=${value};${expires};path=/;domain=${this.domain};SameSite=Lax`;
    }
  
    getCookie(name) {
      const nameEQ = `${name}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
  
    saveToLocalStorage(preferences) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(preferences));
    }
  
    getFromLocalStorage() {
      const preferences = localStorage.getItem(this.localStorageKey);
      return preferences ? JSON.parse(preferences) : null;
    }
  
    acceptAll() {
      const preferences = {
        necessary: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString()
      };
  
      this.setCookie(this.cookieName, 'true');
      this.saveToLocalStorage(preferences);
      this.applyPreferences(preferences);
    }
  
    savePreferences() {
      const preferences = {
        necessary: true,
        analytics: document.getElementById('analytics-consent').checked,
        marketing: document.getElementById('marketing-consent').checked,
        timestamp: new Date().toISOString()
      };
  
      this.setCookie(this.cookieName, 'true');
      this.saveToLocalStorage(preferences);
      this.applyPreferences(preferences);
    }
  
    applyPreferences(preferences) {
      // Remove non-necessary cookies if not consented
      if (!preferences.analytics) {
        this.analyticsCookies.forEach(cookie => {
          this.deleteCookie(cookie);
        });
      }
  
      if (!preferences.marketing) {
        this.marketingCookies.forEach(cookie => {
          this.deleteCookie(cookie);
        });
      }
    }
  
    deleteCookie(name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${this.domain}`;
    }
  
    checkAndShowBanner() {
      const consentCookie = this.getCookie(this.cookieName);
      if (!consentCookie) {
        document.getElementById('cookie-consent-banner').style.display = 'block';
      }
    }
  
    showPreferencesModal() {
      const preferences = this.getFromLocalStorage() || { necessary: true };
      document.getElementById('analytics-consent').checked = preferences.analytics || false;
      document.getElementById('marketing-consent').checked = preferences.marketing || false;
      document.getElementById('cookie-preferences-modal').style.display = 'block';
    }
  
    hidePreferencesModal() {
      document.getElementById('cookie-preferences-modal').style.display = 'none';
    }
  
    hideBanner() {
      document.getElementById('cookie-consent-banner').style.display = 'none';
    }
  }
  
  // Export for both CommonJS and ES modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieConsentManager;
  } else {
    window.CookieConsentManager = CookieConsentManager;
  }