import Modal from './components/modal/index.js';
import Tabs from './components/Tabs.js';
import { CookieManager } from './core/CookieManager.js';
import { StorageManager } from './core/StorageManager.js';
import { LanguageManager } from './core/LanguageManager.js';
import PreferencesButton from './components/PreferencesButton.js';
import { translations, getTranslations } from './translations.js';
import { setupCSP } from './utils/security.js';

const DEBUG = true;

// Check if we're in a development environment or embedded
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('.pages.dev');

// Only set up CSP in development environments
if (DEBUG && isDevelopment) {
  const nonce = setupCSP();
  console.log("CSP setup complete, nonce:", nonce);
} else if (DEBUG) {
  console.log("Skipping CSP setup as we're embedded in a production site");
}

const addDebugListeners = () => {
  document.addEventListener('click', (e) => {
    const target = e.target;
    console.log('Document click:', {
      target,
      targetTag: target.tagName,
      targetClasses: target.className,
      closestModal: target.closest('#cookie-consent-modal') ? 'Found' : 'Not found',
      closestTabButton: target.closest('.tab-button') ? 'Found' : 'Not found',
      closestActionButton: target.closest('[data-action]') ? 'Found' : 'Not found'
    });
  });
};

class CookieConsentManager {
  constructor(options = {}) {
    if (DEBUG) {
      console.log('CookieConsentManager constructor called with options:', options);
      addDebugListeners();
    }
    
    // Initialize core managers
    this.cookieManager = new CookieManager('.herm.io');
    this.storageManager = new StorageManager('herm_cookie_preferences');
    this.languageManager = new LanguageManager(translations);
    
    // Set up properties
    this.currentLanguage = this.languageManager.detectLanguage();
    if (DEBUG) console.log('Detected language:', this.currentLanguage);
    
    // Get language-specific translations
    const languageTranslations = getTranslations(this.currentLanguage);

    this.necessaryCookies = options.necessaryCookies || [];
    this.marketingCookies = options.marketingCookies || [];
    this.analyticsCookies = options.analyticsCookies || [];

    // Initialize UI components with language-specific translations
    if (DEBUG) console.log('Initializing Modal component...');
    this.modal = new Modal({
      translations: languageTranslations,
      language: this.currentLanguage,
      onSave: this.savePreferences.bind(this),
      onDeny: this.denyAll.bind(this),
      onAccept: this.acceptAll.bind(this)
    });

    if (DEBUG) console.log('Initializing Tabs component...');
    this.tabs = new Tabs({
      onTabChange: this.handleTabChange.bind(this)
    });

    if (DEBUG) console.log('Initializing PreferencesButton component...');
    this.preferencesButton = new PreferencesButton({
      onClick: this.showUpdatePreferencesModal.bind(this)
    });

    // Initialize
    this.init();
  }

  init() {
    if (DEBUG) console.log('CookieConsentManager.init() called');
    this.initUI();
    this.checkAndShowBanner();
  }

  initUI() {
    if (DEBUG) console.log('Initializing UI components...');
    
    // Append modal to body
    const modalElement = this.modal.render();
    if (DEBUG) console.log('Modal rendered:', modalElement ? 'success' : 'failed');
    if (modalElement) {
      document.body.appendChild(modalElement);
      if (DEBUG) console.log('Modal appended to body');
    }
    
    // Initialize preferences button
    this.preferencesButton.init();
    if (DEBUG) console.log('Preferences button initialized');
    
    // Initialize tabs
    this.tabs.init();
    if (DEBUG) console.log('Tabs initialized');

    // Add periodic modal state check for debugging
    if (DEBUG) {
      let checkCount = 0;
      const checkInterval = setInterval(() => {
        checkCount++;
        console.log('Modal check ' + checkCount + '/5');
        const modal = document.getElementById('cookie-consent-modal');
        if (modal) {
          console.log('Cookie consent modal state:', {
            exists: true,
            visible: !modal.classList.contains('hidden'),
            tabButtons: modal.querySelectorAll('.tab-button').length,
            actionButtons: modal.querySelectorAll('[data-action]').length,
            zIndex: modal.style.zIndex || '999999',
            display: modal.style.display
          });
        } else {
          console.log('Cookie consent modal state:', { exists: false });
        }
        if (checkCount >= 5) clearInterval(checkInterval);
      }, 1000);
    }
  }

  checkAndShowBanner() {
    if (DEBUG) console.log('Checking cookie consent status...');
    const consentCookie = this.cookieManager.getCookie('herm_cookie_consent');
    if (DEBUG) console.log('Consent cookie value:', consentCookie);
    
    if (!consentCookie) {
      if (DEBUG) console.log('No consent cookie found, showing modal...');
      this.modal.show();
    } else {
      if (DEBUG) console.log('Consent cookie found, modal will not be shown');
    }
  }

  savePreferences() {
    if (DEBUG) console.log('Saving preferences...');
    const preferences = {
      necessary: true,
      analytics: document.getElementById('analytics-consent')?.checked || false,
      marketing: document.getElementById('marketing-consent')?.checked || false,
      preferences: document.getElementById('preferences-consent')?.checked || false,
      timestamp: new Date().toISOString()
    };

    if (DEBUG) console.log('Preferences to save:', preferences);

    this.cookieManager.setCookie('herm_cookie_consent', 'true');
    this.storageManager.save(preferences);
    this.applyPreferences(preferences);
    this.modal.hide();
  }

  denyAll() {
    if (DEBUG) console.log('Denying all optional cookies...');
    const preferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    };

    this.cookieManager.setCookie('herm_cookie_consent', 'true');
    this.storageManager.save(preferences);
    this.applyPreferences(preferences);
    this.modal.hide();
  }

  acceptAll() {
    if (DEBUG) console.log('Accepting all cookies...');
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    };

    this.cookieManager.setCookie('herm_cookie_consent', 'true');
    this.storageManager.save(preferences);
    this.applyPreferences(preferences);
    this.modal.hide();
  }

  applyPreferences(preferences) {
    if (DEBUG) console.log('Applying preferences:', preferences);
    if (!preferences.analytics) {
      this.analyticsCookies.forEach(cookie => {
        this.cookieManager.deleteCookie(cookie);
      });
    }
    if (!preferences.marketing) {
      this.marketingCookies.forEach(cookie => {
        this.cookieManager.deleteCookie(cookie);
      });
    }
  }

  showUpdatePreferencesModal() {
    if (DEBUG) console.log('Showing update preferences modal...');
    this.modal.show();
  }

  handleTabChange(tabId) {
    if (DEBUG) console.log('Tab change requested:', tabId);
    this.modal.switchToTab(tabId);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.CookieConsentManager = CookieConsentManager;
}

export default CookieConsentManager;