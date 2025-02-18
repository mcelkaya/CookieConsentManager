/* eslint-disable security/detect-object-injection */
import { sanitizeHTML } from '../utils/dom';
import { validateData } from '../utils/security';

const DEBUG = true;

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
    if (DEBUG) console.log('Modal constructor called with options:', options);

    const optionsSchema = {
      translations: { type: 'object', required: true },
      language: { type: 'string', required: true, pattern: /^[a-z]{2}$/i },
      onSave: { type: 'function', required: true },
      onDeny: { type: 'function', required: true },
      onAccept: { type: 'function', required: true }
    };

    if (!validateData(options, optionsSchema)) {
      console.error('Invalid Modal configuration');
      throw new Error('Invalid Modal configuration');
    }

    this.translations = options.translations;
    this.language = options.language;
    this.onSave = options.onSave;
    this.onDeny = options.onDeny;
    this.onAccept = options.onAccept;
    this.isOpen = false;

    // Bind methods to preserve context
    this._handleClick = this._handleClick.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
  }

  render() {
    const t = this.getTranslations();
    if (!t) return null;

    const modal = document.createElement('div');
    modal.id = 'cookie-consent-modal';
    modal.className = 'hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center pointer-events-auto';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    const content = `
      <div class="relative bg-white rounded-lg w-full max-w-2xl mx-4">
        <!-- Tab Navigation -->
        <div class="flex border-b" role="tablist">
          ${Object.entries(VALID_TABS).map(([key, value]) => `
            <button
              type="button"
              class="px-6 py-4 font-medium tab-button ${key === 'consent' ? 'active text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}"
              data-tab="${value}"
              role="tab"
              aria-selected="${key === 'consent'}"
              aria-controls="${value}-tab"
            >${sanitizeHTML(t.tabs[key] || key)}</button>
          `).join('')}
        </div>

        <!-- Consent Tab -->
        <div id="consent-tab" class="tab-content p-6" role="tabpanel">
          <h2 id="modal-title" class="text-xl font-bold mb-4">
            ${sanitizeHTML(t.initialModal.title)}
          </h2>
          <p class="text-gray-700 mb-6">
            ${sanitizeHTML(t.initialModal.description)}
          </p>
          
          <div class="grid grid-cols-4 gap-4 mb-6 border-t border-b py-4">
            ${COOKIE_TYPES.map(({ id, isRequired }) => `
              <div class="text-center">
                <p class="font-medium mb-2">${sanitizeHTML(t.cookieTypes[id]?.title || id)}</p>
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
            `).join('')}
          </div>

          <div class="flex gap-4">
            <button 
              type="button"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 pointer-events-auto"
              data-action="deny"
            >${sanitizeHTML(t.initialModal.deny)}</button>
            <button
              type="button"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 pointer-events-auto"
              data-action="save"
            >${sanitizeHTML(t.initialModal.allowSelection)}</button>
            <button
              type="button"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 pointer-events-auto"
              data-action="accept"
            >${sanitizeHTML(t.initialModal.allowAll)}</button>
          </div>
        </div>

        <!-- Details Tab -->
        <div id="details-tab" class="tab-content hidden p-6" role="tabpanel">
          <div class="space-y-4">
            ${COOKIE_TYPES.map(({ id, isRequired }) => `
              <div class="cookie-section rounded-lg border border-gray-200 p-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium">${sanitizeHTML(t.cookieTypes[id]?.title || id)}</h3>
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
                <p class="text-gray-600 mt-2">${sanitizeHTML(t.cookieTypes[id]?.description || '')}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- About Tab -->
        <div id="about-tab" class="tab-content hidden p-6" role="tabpanel">
          <div class="space-y-4">
            <p class="text-gray-600">${sanitizeHTML(t.about?.intro || '')}</p>
            <p class="text-gray-600">${sanitizeHTML(t.about?.legal || '')}</p>
            <p class="text-gray-600">${sanitizeHTML(t.about?.usage || '')}</p>
            <p class="text-gray-600">
              ${sanitizeHTML(t.about?.changeConsent || '')}
              <a href="#" class="text-blue-600 hover:underline">
                ${sanitizeHTML(t.about?.cookieDeclaration || '')}
              </a>
            </p>
            <p class="text-gray-600">
              ${sanitizeHTML(t.about?.privacy?.text || '')}
              <a href="#" class="text-blue-600 hover:underline">
                ${sanitizeHTML(t.about?.privacy?.link || '')}
              </a>
            </p>
          </div>
        </div>
      </div>
    `;

    modal.innerHTML = sanitizeHTML(content);
    return modal;
  }

  _handleClick(event) {
    if (DEBUG) {
      console.log('Click event:', {
        target: event.target,
        currentTarget: event.currentTarget,
        dataAction: event.target.getAttribute('data-action'),
        dataTab: event.target.getAttribute('data-tab'),
        parentAction: event.target.closest('[data-action]')?.getAttribute('data-action'),
        parentTab: event.target.closest('.tab-button')?.getAttribute('data-tab')
      });
    }
    event.preventDefault();

    // Handle tab button clicks
    const tabButton = event.target.closest('.tab-button');
    if (tabButton) {
      const tabId = tabButton.getAttribute('data-tab');
      if (DEBUG) console.log('Tab button clicked:', tabId);
      if (VALID_TABS[tabId]) {
        this.switchToTab(tabId);
      }
      event.stopPropagation();
      return;
    }

    // Handle action button clicks
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      const action = actionButton.getAttribute('data-action');
      if (DEBUG) console.log('Action button clicked:', action);
      event.stopPropagation();
      switch (action) {
        case 'deny':
          this.onDeny();
          break;
        case 'save':
          this.onSave();
          break;
        case 'accept':
          this.onAccept();
          break;
        default:
          console.warn('Unknown action:', action);
      }
    }
  }

  _handleChange(event) {
    if (DEBUG) console.log('Change event:', event);
    const target = event.target;
    
    if (target.matches('input[type="checkbox"][data-category]')) {
      const category = target.getAttribute('data-category');
      if (!category) return;

      const mainToggle = document.getElementById(`${category}-consent`);
      const detailsToggle = document.getElementById(`${category}-consent-details`);
      
      if (mainToggle && detailsToggle) {
        const isChecked = target.checked;
        mainToggle.checked = isChecked;
        detailsToggle.checked = isChecked;
      }
    }
  }

  _handleKeyDown(event) {
    if (event.key === 'Escape' && this.isOpen) {
      this.hide();
    }
  }

  _handleOutsideClick(event) {
    const modal = document.getElementById('cookie-consent-modal');
    if (modal && !modal.contains(event.target) && this.isOpen) {
      this.hide();
    }
  }

  show() {
    if (DEBUG) console.log('Showing modal');
    const modal = document.getElementById('cookie-consent-modal');
    if (!modal) {
      console.error('Modal element not found');
      return;
    }

    // Remove any previously attached listeners
    this.removeEventListeners();

    // Attach event listeners in the bubbling phase
    modal.addEventListener('click', this._handleClick, false);
    modal.addEventListener('change', this._handleChange, false);
    document.addEventListener('keydown', this._handleKeyDown);
    document.addEventListener('click', this._handleOutsideClick);

    modal.classList.remove('hidden');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  hide() {
    if (DEBUG) console.log('Hiding modal');
    const modal = document.getElementById('cookie-consent-modal');
    if (!modal) {
      console.error('Modal element not found');
      return;
    }

    this.removeEventListeners();
    modal.classList.add('hidden');
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  removeEventListeners() {
    const modal = document.getElementById('cookie-consent-modal');
    if (!modal) return;

    modal.removeEventListener('click', this._handleClick, false);
    modal.removeEventListener('change', this._handleChange, false);
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('click', this._handleOutsideClick);
  }

  switchToTab(tabId) {
    if (DEBUG) console.log('Switching to tab:', tabId);
    if (!VALID_TABS[tabId]) {
      console.warn('Invalid tab ID:', tabId);
      return;
    }

    const modal = document.getElementById('cookie-consent-modal');
    if (!modal) {
      console.error('Modal element not found');
      return;
    }

    // Update tab buttons
    modal.querySelectorAll('.tab-button').forEach(button => {
      const isActive = button.getAttribute('data-tab') === tabId;
      button.classList.toggle('active', isActive);
      button.classList.toggle('text-blue-600', isActive);
      button.classList.toggle('border-b-2', isActive);
      button.classList.toggle('border-blue-600', isActive);
      button.classList.toggle('text-gray-600', !isActive);
      button.setAttribute('aria-selected', isActive.toString());
    });

    // Update content visibility
    modal.querySelectorAll('.tab-content').forEach(panel => {
      panel.classList.toggle('hidden', !panel.id.startsWith(tabId));
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