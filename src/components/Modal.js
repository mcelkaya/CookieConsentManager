/* eslint-disable security/detect-object-injection */
import { addEventListeners } from '../utils/events';
import { sanitizeHTML, safeQuerySelector, setSafeAttribute, toggleClass } from '../utils/dom';
import { validateData } from '../utils/security';

const VALID_TABS = {
  consent: 'consent',
  details: 'details',
  about: 'about'
};

const COOKIE_TYPES = [
  { id: 'necessary', isRequired: true },
  { id: 'preferences', isRequired: false },
  { id: 'statistics', isRequired: false },
  { id: 'marketing', isRequired: false }
];

export default class Modal {
  constructor(options = {}) {
    const optionsSchema = {
      translations: { type: 'object', required: true },
      language: { type: 'string', required: true, pattern: /^[a-z]{2}$/i },
      onSave: { type: 'function', required: true },
      onDeny: { type: 'function', required: true },
      onAccept: { type: 'function', required: true }
    };

    if (!validateData(options, optionsSchema)) {
      throw new Error('Invalid Modal configuration');
    }

    this.translations = options.translations;
    this.language = options.language;
    this.onSave = options.onSave;
    this.onDeny = options.onDeny;
    this.onAccept = options.onAccept;
    this.isOpen = false;
    
    // Bind methods
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleToggleChange = this.handleToggleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  render() {
    const t = this.getTranslations();
    if (!t) return '';

    const modal = document.createElement('div');
    modal.id = 'cookie-consent-modal';
    modal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 z-[9999]';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    const modalContent = document.createElement('div');
    modalContent.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg w-full max-w-2xl';

    // Inline sanitization at insertion time
    modalContent.innerHTML =
      sanitizeHTML(this.renderTabNavigation(t)) +
      sanitizeHTML(this.renderConsentTab(t)) +
      sanitizeHTML(this.renderDetailsTab(t)) +
      sanitizeHTML(this.renderAboutTab(t));
    modal.appendChild(modalContent);
    return modal;
  }

  renderTabNavigation(t) {
    // Use a hard-coded list of keys to avoid dynamic object access
    const keys = ['consent', 'details', 'about'];
    return keys
      .map((key) => {
        const value = VALID_TABS[key];
        const isConsent = key === 'consent';
        // Use a direct property check for the label
        const label = (t.tabs && Object.prototype.hasOwnProperty.call(t.tabs, key) ? t.tabs[key] : key);
        return `
          <button class="px-6 py-4 font-medium tab-button ${isConsent ? 'active' : ''}" 
                  data-tab="${value}" 
                  role="tab" 
                  aria-selected="${isConsent}" 
                  aria-controls="${value}-tab">
            ${sanitizeHTML(label)}
          </button>
        `;
      })
      .join('');
  }

  renderConsentTab(t) {
    const title = (t.initialModal && Object.prototype.hasOwnProperty.call(t.initialModal, 'title') ? t.initialModal.title : '') || '';
    const description = (t.initialModal && Object.prototype.hasOwnProperty.call(t.initialModal, 'description') ? t.initialModal.description : '') || '';
    return `
      <div id="consent-tab" 
           class="tab-content active p-6" 
           role="tabpanel" 
           aria-labelledby="consent-tab">
        <h2 id="modal-title" class="text-xl font-bold mb-4">${sanitizeHTML(title)}</h2>
        <p class="text-gray-700 mb-6">${sanitizeHTML(description)}</p>
        
        <div class="grid grid-cols-4 gap-4 mb-6 border-t border-b py-4">
          ${this.renderCookieToggles(t)}
        </div>

        <div class="flex justify-between gap-4">
          ${this.renderActionButtons(t)}
        </div>
      </div>
    `;
  }

  renderCookieToggles(t) {
    return COOKIE_TYPES.map(({ id, isRequired }) => {
      const title =
        (t.cookieTypes && t.cookieTypes[id] && Object.prototype.hasOwnProperty.call(t.cookieTypes[id], 'title')
          ? t.cookieTypes[id].title
          : id);
      return `
        <div class="text-center">
          <p class="font-medium mb-2">${sanitizeHTML(title)}</p>
          <label class="switch">
            <input type="checkbox" 
                   id="${id}-consent"
                   data-category="${id}"
                   ${isRequired ? 'checked disabled' : ''}
                   aria-label="${sanitizeHTML(title)}">
            <span class="slider round"></span>
          </label>
        </div>
      `;
    }).join('');
  }

  renderActionButtons(t) {
    const denyText =
      (t.initialModal && Object.prototype.hasOwnProperty.call(t.initialModal, 'deny') ? t.initialModal.deny : 'Deny') || 'Deny';
    const allowSelectionText =
      (t.initialModal && Object.prototype.hasOwnProperty.call(t.initialModal, 'allowSelection') ? t.initialModal.allowSelection : 'Allow Selection') || 'Allow Selection';
    const allowAllText =
      (t.initialModal && Object.prototype.hasOwnProperty.call(t.initialModal, 'allowAll') ? t.initialModal.allowAll : 'Allow All') || 'Allow All';
    return `
      <button id="deny-cookies" 
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              data-action="deny">
        ${sanitizeHTML(denyText)}
      </button>
      <button id="allow-selected" 
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              data-action="save">
        ${sanitizeHTML(allowSelectionText)}
      </button>
      <button id="accept-all" 
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              data-action="accept">
        ${sanitizeHTML(allowAllText)}
      </button>
    `;
  }

  renderDetailsTab(t) {
    return `
      <div id="details-tab" 
           class="tab-content hidden p-6" 
           role="tabpanel" 
           aria-labelledby="details-tab">
        <div class="space-y-4">
          ${this.renderCookieSections(t)}
        </div>
      </div>
    `;
  }
  
  renderCookieSections(t) {
    return COOKIE_TYPES.map(({ id, isRequired }) => {
      const content = (t.cookieTypes && t.cookieTypes[id]) || { title: id, description: '' };
      return this.renderCookieSection(id, content, isRequired);
    }).join('');
  }
  
  renderCookieSection(id, content, isRequired) {
    return `
      <div class="cookie-section" data-section="${sanitizeHTML(id)}">
        <button class="w-full flex items-center justify-between py-2 text-left" 
                aria-expanded="false"
                aria-controls="${id}-content">
          <span class="font-medium">${sanitizeHTML(content.title || id)}</span>
          <span class="transform transition-transform duration-200">▼</span>
        </button>
        <div id="${id}-content" 
             class="cookie-section-content hidden pt-2 pb-4 pl-4">
          <p class="text-gray-600">${sanitizeHTML(content.description || '')}</p>
        </div>
        <label class="switch absolute right-6">
          <input type="checkbox" 
                 id="${id}-consent-details" 
                 data-category="${id}"
                 ${isRequired ? 'checked disabled' : ''}
                 aria-label="${sanitizeHTML(content.title || id)}">
          <span class="slider round"></span>
        </label>
      </div>
    `;
  }
  
  renderAboutTab(t) {
    const about = t.about || {};
    return `
      <div id="about-tab" 
           class="tab-content hidden p-6" 
           role="tabpanel" 
           aria-labelledby="about-tab">
        <div class="space-y-4">
          <p class="text-gray-600">${sanitizeHTML(about.intro || '')}</p>
          <p class="text-gray-600">${sanitizeHTML(about.legal || '')}</p>
          <p class="text-gray-600">${sanitizeHTML(about.usage || '')}</p>
          <p class="text-gray-600">
            ${sanitizeHTML(about.changeConsent || '')}
            <a href="#" class="text-blue-600 hover:underline">
              ${sanitizeHTML(about.cookieDeclaration || '')}
            </a>
          </p>
          <p class="text-gray-600">
            ${sanitizeHTML((about.privacy && about.privacy.text) || '')}
            <a href="#" class="text-blue-600 hover:underline">
              ${sanitizeHTML((about.privacy && about.privacy.link) || '')}
            </a>
          </p>
          <p class="text-gray-600">${sanitizeHTML(about.consentId || '')}</p>
        </div>
      </div>
    `;
  }
  
  show() {
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (!modal) return;
  
    modal.classList.remove('hidden');
    this.isOpen = true;
    this.addEventListeners();
    this.trapFocus();
    document.body.style.overflow = 'hidden';
  }
  
  hide() {
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (!modal) return;
  
    modal.classList.add('hidden');
    this.isOpen = false;
    this.removeEventListeners();
    document.body.style.overflow = '';
  }
  
  addEventListeners() {
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (!modal) return;
  
    modal.querySelectorAll('.tab-button').forEach(button => {
      addEventListeners(button, { click: this.handleTabClick });
    });
  
    modal.querySelectorAll('input[type="checkbox"][data-category]').forEach(toggle => {
      addEventListeners(toggle, { change: this.handleToggleChange });
    });
  
    modal.querySelectorAll('[data-action]').forEach(button => {
      addEventListeners(button, {
        click: (e) => {
          const action = e.target.dataset.action;
          if (action === 'deny') this.onDeny();
          if (action === 'save') this.onSave();
          if (action === 'accept') this.onAccept();
        }
      });
    });
  
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('click', this.handleOutsideClick);
  }
  
  removeEventListeners() {
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (!modal) return;
  
    modal.querySelectorAll('button, input').forEach(element => {
      element.removeEventListener('click', this.handleTabClick);
      element.removeEventListener('change', this.handleToggleChange);
    });
  
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleOutsideClick);
  }
  
  handleTabClick(event) {
    const button = event.target.closest('.tab-button');
    if (!button) return;
    const tabId = button.dataset.tab;
    if (['consent', 'details', 'about'].includes(tabId)) {
      this.switchToTab(tabId);
    }
  }
  
  handleToggleChange(event) {
    const category = event.target.dataset.category;
    if (!category) return;
    const mainToggle = document.getElementById(`${category}-consent`);
    const detailsToggle = document.getElementById(`${category}-consent-details`);
    if (mainToggle && detailsToggle) {
      const isChecked = event.target.checked;
      mainToggle.checked = isChecked;
      detailsToggle.checked = isChecked;
    }
  }
  
  handleKeyDown(event) {
    if (!this.isOpen) return;
    if (event.key === 'Escape') this.hide();
  }
  
  handleOutsideClick(event) {
    if (!this.isOpen) return;
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (modal && !modal.contains(event.target)) this.hide();
  }
  
  switchToTab(tabId) {
    if (!['consent', 'details', 'about'].includes(tabId)) return;
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (!modal) return;
    modal.querySelectorAll('.tab-button').forEach(button => {
      const isActive = button.dataset.tab === tabId;
      toggleClass(button, 'active', isActive);
      setSafeAttribute(button, 'aria-selected', String(isActive));
    });
    modal.querySelectorAll('.tab-content').forEach(content => {
      toggleClass(content, 'hidden', !content.id.startsWith(tabId));
    });
  }
  
  getTranslations() {
    try {
      return (this.translations && this.translations[this.language]) || this.translations.en;
    } catch (error) {
      console.error('Failed to get translations:', error);
      return null;
    }
  }
  
  trapFocus() {
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (!modal) return;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    });
    firstFocusable.focus();
  }
}
/* eslint-enable security/detect-object-injection */