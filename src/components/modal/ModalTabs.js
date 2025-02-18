export default class ModalTabs {
    constructor({ translations, activeTab = 'consent', onTabChange } = {}) {
      this.translations = translations;
      this.activeTab = activeTab;
      this.onTabChange = onTabChange;
      this.VALID_TABS = {
        consent: 'consent',
        details: 'details',
        about: 'about'
      };
      this.COOKIE_TYPES = [
        { id: 'necessary', isRequired: true },
        { id: 'preferences', isRequired: false },
        { id: 'statistics', isRequired: false },
        { id: 'marketing', isRequired: false }
      ];
    }
    
    render() {
      const t = this.translations;
      const container = document.createElement('div');
      
      // Create tab navigation
      const tabNav = document.createElement('div');
      tabNav.className = 'flex border-b';
      tabNav.setAttribute('role', 'tablist');
      Object.entries(this.VALID_TABS).forEach(([key, value]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `px-6 py-4 font-medium tab-button ${key === this.activeTab ? 'active text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`;
        button.dataset.tab = value;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', key === this.activeTab ? 'true' : 'false');
        button.setAttribute('aria-controls', `${value}-tab`);
        button.innerHTML = t.tabs ? (t.tabs[key] || key) : key;
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.activeTab = value;
          if (typeof this.onTabChange === 'function') {
            this.onTabChange(value);
          }
          this.updateTabStates(container);
        });
        tabNav.appendChild(button);
      });
      container.appendChild(tabNav);
      
      // Create tab panels
      // Consent Panel
      const consentPanel = document.createElement('div');
      consentPanel.id = 'consent-tab';
      consentPanel.className = 'tab-content p-6';
      consentPanel.setAttribute('role', 'tabpanel');
      consentPanel.innerHTML = `
        <h2 id="modal-title" class="text-xl font-bold mb-4">${t.initialModal.title}</h2>
        <p class="text-gray-700 mb-6">${t.initialModal.description}</p>
        <div class="grid grid-cols-4 gap-4 mb-6 border-t border-b py-4">
          ${this.COOKIE_TYPES.map(({ id, isRequired }) => `
            <div class="text-center">
              <p class="font-medium mb-2">${t.cookieTypes && t.cookieTypes[id] ? t.cookieTypes[id].title : id}</p>
              <label class="switch inline-block">
                <input type="checkbox" id="${id}-consent" data-category="${id}" ${isRequired ? 'checked disabled' : ''} class="hidden" />
                <div class="toggle-slider">
                  <div class="toggle-knob"></div>
                </div>
              </label>
            </div>
          `).join('')}
        </div>
      `;
      container.appendChild(consentPanel);
      
      // Details Panel (hidden by default)
      const detailsPanel = document.createElement('div');
      detailsPanel.id = 'details-tab';
      detailsPanel.className = 'tab-content hidden p-6';
      detailsPanel.setAttribute('role', 'tabpanel');
      detailsPanel.innerHTML = `<div class="space-y-4">
        ${this.COOKIE_TYPES.map(({ id, isRequired }) => `
          <div class="cookie-section rounded-lg border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">${t.cookieTypes && t.cookieTypes[id] ? t.cookieTypes[id].title : id}</h3>
              <label class="switch inline-block">
                <input type="checkbox" id="${id}-consent-details" data-category="${id}" ${isRequired ? 'checked disabled' : ''} class="hidden" />
                <div class="toggle-slider">
                  <div class="toggle-knob"></div>
                </div>
              </label>
            </div>
            <p class="text-gray-600 mt-2">${t.cookieTypes && t.cookieTypes[id] ? t.cookieTypes[id].description : ''}</p>
          </div>
        `).join('')}
      </div>`;
      container.appendChild(detailsPanel);
      
      // About Panel (hidden by default)
      const aboutPanel = document.createElement('div');
      aboutPanel.id = 'about-tab';
      aboutPanel.className = 'tab-content hidden p-6';
      aboutPanel.setAttribute('role', 'tabpanel');
      aboutPanel.innerHTML = `
        <div class="space-y-4">
          <p class="text-gray-600">${t.about ? t.about.intro : ''}</p>
          <p class="text-gray-600">${t.about ? t.about.legal : ''}</p>
          <p class="text-gray-600">${t.about ? t.about.usage : ''}</p>
          <p class="text-gray-600">${t.about ? t.about.changeConsent : ''} 
            <a href="#" class="text-blue-600 hover:underline">${t.about ? t.about.cookieDeclaration : ''}</a>
          </p>
          <p class="text-gray-600">${t.about && t.about.privacy ? t.about.privacy.text : ''} 
            <a href="#" class="text-blue-600 hover:underline">${t.about && t.about.privacy ? t.about.privacy.link : ''}</a>
          </p>
        </div>
      `;
      container.appendChild(aboutPanel);
      
      return container;
    }
    
    updateTabStates(container) {
      const buttons = container.querySelectorAll('.tab-button');
      buttons.forEach((button) => {
        const tab = button.dataset.tab;
        const isActive = tab === this.activeTab;
        if (isActive) {
          button.classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
          button.classList.remove('text-gray-600');
          button.setAttribute('aria-selected', 'true');
        } else {
          button.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
          button.classList.add('text-gray-600');
          button.setAttribute('aria-selected', 'false');
        }
      });
      const panels = container.querySelectorAll('.tab-content');
      panels.forEach((panel) => {
        if (panel.id.startsWith(this.activeTab)) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    }
  }