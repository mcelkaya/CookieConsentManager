import { Modal } from './components/Modal';
import { Tabs } from './components/Tabs';
import { CookieManager } from './core/CookieManager';
import { StorageManager } from './core/StorageManager';
import { LanguageManager } from './core/LanguageManager';
import { PreferencesButton } from './components/PreferencesButton';
import { translations } from './translations';
import { createElement } from './utils/dom';

class CookieConsentManager {
  constructor(options = {}) {
    // Initialize core managers
    this.cookieManager = new CookieManager('.herm.io');
    this.storageManager = new StorageManager('herm_cookie_preferences');
    this.languageManager = new LanguageManager(translations);
    
    // Set up properties
    this.currentLanguage = this.languageManager.detectLanguage();
    this.necessaryCookies = options.necessaryCookies || [];
    this.marketingCookies = options.marketingCookies || [];
    this.analyticsCookies = options.analyticsCookies || [];

    // Initialize UI components
    this.modal = new Modal({
      translations,
      language: this.currentLanguage,
      onSave: this.savePreferences.bind(this),
      onDeny: this.denyAll.bind(this),
      onAccept: this.acceptAll.bind(this)
    });

    this.tabs = new Tabs({
      onTabChange: this.handleTabChange.bind(this)
    });

    this.preferencesButton = new PreferencesButton({
      onClick: this.showUpdatePreferencesModal.bind(this)
    });

    // Initialize
    this.init();
  }

  init() {
    this.initUI();
    this.checkAndShowBanner();
  }

  initUI() {
    // Append modal to body
    document.body.appendChild(createElement(this.modal.render()));
    
    // Initialize preferences button
    this.preferencesButton.init();
    
    // Initialize tabs
    this.tabs.init();
  }

  checkAndShowBanner() {
    const consentCookie = this.cookieManager.getCookie('herm_cookie_consent');
    if (!consentCookie) {
      this.modal.show();
    }
  }

  savePreferences() {
    const preferences = {
      necessary: true,
      analytics: document.getElementById('analytics-consent').checked,
      marketing: document.getElementById('marketing-consent').checked,
      preferences: document.getElementById('preferences-consent').checked,
      timestamp: new Date().toISOString()
    };

    this.cookieManager.setCookie('herm_cookie_consent', 'true');
    this.storageManager.save(preferences);
    this.applyPreferences(preferences);
    this.modal.hide();
  }

  denyAll() {
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
    this.modal.showUpdatePreferences();
  }

  handleTabChange(tabId) {
    this.modal.switchToTab(tabId);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.CookieConsentManager = CookieConsentManager;
}

export default CookieConsentManager;