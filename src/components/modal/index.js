import ModalOverlay from './ModalOverlay.js';
import ModalContent from './ModalContent.js';
import ModalTabs from './ModalTabs.js';
import ModalActions from './ModalActions.js';

export default class Modal {
    constructor(options = {}) {
      this.translations = options.translations;
      this.language = options.language;
      this.onSave = options.onSave;
      this.onDeny = options.onDeny;
      this.onAccept = options.onAccept;
      this.onTabChange = options.onTabChange;
      this.activeTab = 'consent';
      
      this.handleAction = this.handleAction.bind(this);
      
      this.overlay = new ModalOverlay({
        onOutsideClick: (e) => {
          if (e.target.id === 'cookie-consent-modal') {
            if (typeof this.onDeny === 'function') {
              this.onDeny();
            }
            this.hide();
          }
        }
      });
      
      this.content = new ModalContent();
      this.tabs = new ModalTabs({
        translations: this.translations,
        activeTab: this.activeTab,
        onTabChange: (tab) => {
          this.activeTab = tab;
          if (typeof this.onTabChange === 'function') {
            this.onTabChange(tab);
          }
        }
      });
      
      this.actions = new ModalActions({
        translations: this.translations
      });
      
      this.modalElement = null;
      this.isOpen = false;
    }
    
    handleAction(event) {
      const actionButton = event.target.closest('[data-action]');
      if (!actionButton) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const action = actionButton.getAttribute('data-action');
      switch (action) {
        case 'deny':
          if (typeof this.onDeny === 'function') {
            this.onDeny();
          }
          break;
        case 'save':
          if (typeof this.onSave === 'function') {
            this.onSave();
          }
          break;
        case 'accept':
          if (typeof this.onAccept === 'function') {
            this.onAccept();
          }
          break;
      }
    }
    
    render() {
      const tabsElement = this.tabs.render();
      const actionsElement = this.actions.render();
      
      const innerContainer = document.createElement('div');
      innerContainer.className = 'modal-inner';
      innerContainer.appendChild(tabsElement);
      innerContainer.appendChild(actionsElement);
      
      // Add event delegation for action buttons
      innerContainer.addEventListener('click', this.handleAction, true); // Using capture phase
      
      const contentElement = this.content.render(innerContainer);
      this.modalElement = this.overlay.render(contentElement);
      
      // Add a direct click handler to the modal content for debugging
      if (typeof window !== 'undefined' && window.DEBUG) {
        contentElement.addEventListener('click', (e) => {
          console.log('Modal content click:', {
            target: e.target,
            action: e.target.closest('[data-action]')?.getAttribute('data-action'),
            prevented: e.defaultPrevented
          });
        }, true);
      }
      
      return this.modalElement;
    }
    
    show() {
      if (!this.modalElement) {
        this.render();
        document.body.appendChild(this.modalElement);
      }
      this.modalElement.classList.remove('hidden');
      this.modalElement.style.display = 'flex';
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
    }
    
    hide() {
      if (this.modalElement) {
        this.modalElement.classList.add('hidden');
        this.modalElement.style.display = 'none';
        this.isOpen = false;
        document.body.style.overflow = '';
      }
    }

    switchToTab(tabId) {
      if (this.tabs && typeof this.tabs.switchTab === 'function') {
        this.tabs.switchTab(tabId);
      }
    }
}