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
    modal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    const modalContent = document.createElement('div');
    modalContent.className = 'relative bg-white rounded-lg w-full max-w-2xl mx-4';

    modalContent.innerHTML = sanitizeHTML(
      this.renderTabNavigation(t) +
      this.renderConsentTab(t) +
      this.renderDetailsTab(t) +
      this.renderAboutTab(t)
    );

    modal.appendChild(modalContent);
    return modal;
  }

  renderTabNavigation(t) {
    return `
      <div class="flex border-b">
        ${Object.entries(VALID_TABS).map(([key, value]) => {
          const isActive = key === 'consent';
          return `
            <button
              class="px-6 py-4 font-medium tab-button ${isActive ? 'active text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}"
              data-tab="${value}"
              role="tab"
              aria-selected="${isActive}"
              aria-controls="${value}-tab"
            >
              ${sanitizeHTML(t.tabs[key] || key)}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  renderConsentTab(t) {
    return `
      <div id="consent-tab" class="tab-content active p-6" role="tabpanel" aria-labelledby="consent-tab">
        <h2 id="modal-title" class="text-xl font-bold mb-4">
          ${sanitizeHTML(t.initialModal.title)}
        </h2>
        <p class="text-gray-700 mb-6">
          ${sanitizeHTML(t.initialModal.description)}
        </p>
        
        <div class="grid grid-cols-4 gap-4 mb-6 border-t border-b py-4">
          ${this.renderCookieToggles(t)}
        </div>

        <div class="flex gap-4">
          ${this.renderActionButtons(t)}
        </div>
      </div>
    `;
  }

  renderCookieToggles(t) {
    return COOKIE_TYPES.map(({ id, isRequired }) => {
      const cookieType = t.cookieTypes[id] || { title: id };
      return `
        <div class="text-center">
          <p class="font-medium mb-2">${sanitizeHTML(cookieType.title)}</p>
          <label class="switch inline-block">
            <input
              type="checkbox"
              id="${id}-consent"
              data-category="${id}"
              ${isRequired ? 'checked disabled' : ''}
              class="hidden"
            />
            <div class="toggle-slider">
              <div class="toggle-knob"></div>
            </div>
          </label>
        </div>
      `;
    }).join('');
  }

  renderActionButtons(t) {
    return `
      <button 
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        data-action="deny"
      >
        ${sanitizeHTML(t.initialModal.deny)}
      </button>
      <button
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        data-action="save"
      >
        ${sanitizeHTML(t.initialModal.allowSelection)}
      </button>
      <button
        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        data-action="accept"
      >
        ${sanitizeHTML(t.initialModal.allowAll)}
      </button>
    `;
  }

  renderDetailsTab(t) {
    return `
      <div id="details-tab" class="tab-content hidden p-6" role="tabpanel" aria-labelledby="details-tab">
        <div class="space-y-4">
          ${this.renderCookieSections(t)}
        </div>
      </div>
    `;
  }

  renderCookieSections(t) {
    return COOKIE_TYPES.map(({ id, isRequired }) => {
      const cookieType = t.cookieTypes[id] || { title: id, description: '' };
      return `
        <div class="cookie-section rounded-lg border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">${sanitizeHTML(cookieType.title)}</h3>
            <label class="switch inline-block">
              <input
                type="checkbox"
                id="${id}-consent-details"
                data-category="${id}"
                ${isRequired ? 'checked disabled' : ''}
                class="hidden"
              />
              <div class="toggle-slider">
                <div class="toggle-knob"></div>
              </div>
            </label>
          </div>
          <p class="text-gray-600 mt-2">${sanitizeHTML(cookieType.description)}</p>
        </div>
      `;
    }).join('');
  }

  renderAboutTab(t) {
    const about = t.about || {};
    return `
      <div id="about-tab" class="tab-content hidden p-6" role="tabpanel" aria-labelledby="about-tab">
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
        </div>
      </div>
    `;
  }

  handleTabClick(event) {
    const button = event.target.closest('.tab-button');
    if (!button) return;
    
    const tabId = button.dataset.tab;
    if (Object.values(VALID_TABS).includes(tabId)) {
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

  switchToTab(tabId) {
    if (!Object.values(VALID_TABS).includes(tabId)) return;

    const modal = safeQuerySelector('#cookie-consent-modal');
    if (!modal) return;

    // Update tab buttons
    modal.querySelectorAll('.tab-button').forEach(button => {
      const isActive = button.dataset.tab === tabId;
      toggleClass(button, 'active', isActive);
      toggleClass(button, 'text-blue-600', isActive);
      toggleClass(button, 'border-b-2', isActive);
      toggleClass(button, 'border-blue-600', isActive);
      toggleClass(button, 'text-gray-600', !isActive);
      setSafeAttribute(button, 'aria-selected', String(isActive));
    });

    // Update content visibility
    modal.querySelectorAll('.tab-content').forEach(content => {
      toggleClass(content, 'hidden', !content.id.startsWith(tabId));
    });
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
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleOutsideClick);
  }

  handleKeyDown(event) {
    if (event.key === 'Escape' && this.isOpen) {
      this.hide();
    }
  }

  handleOutsideClick(event) {
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (modal && !modal.contains(event.target) && this.isOpen) {
      this.hide();
    }
  }

  trapFocus() {
    const modal = safeQuerySelector('#cookie-consent-modal');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    firstFocusable.focus();

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
  }

  getTranslations() {
    try {
      return (this.translations && this.translations[this.language]) || this.translations.en;
    } catch (error) {
      console.error('Failed to get translations:', error);
      return null;
    }
  }
}
/* eslint-enable security/detect-object-injection */