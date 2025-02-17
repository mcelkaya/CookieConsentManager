import Modal from './components/Modal';
import Tabs from './components/Tabs';
import { CookieManager } from './core/CookieManager';
import { StorageManager } from './core/StorageManager';
import { LanguageManager } from './core/LanguageManager';
import PreferencesButton from './components/PreferencesButton';
import { translations } from './translations';

const DEBUG = true;

class CookieConsentManager {
  constructor(options = {}) {
    if (DEBUG) console.log('CookieConsentManager constructor called with options:', options);
    
    // Initialize core managers
    this.cookieManager = new CookieManager('.herm.io');
    this.storageManager = new StorageManager('herm_cookie_preferences');
    this.languageManager = new LanguageManager(translations);
    
    // Set up properties
    this.currentLanguage = this.languageManager.detectLanguage();
    if (DEBUG) console.log('Detected language:', this.currentLanguage);
    
    this.necessaryCookies = options.necessaryCookies || [];
    this.marketingCookies = options.marketingCookies || [];
    this.analyticsCookies = options.analyticsCookies || [];

    // Initialize UI components
    if (DEBUG) console.log('Initializing Modal component...');
    this.modal = new Modal({
      translations,
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