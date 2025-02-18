import ModalOverlay from './ModalOverlay.js';
import ModalContent from './ModalContent.js';
import ModalTabs from './ModalTabs.js';
import ModalActions from './ModalActions.js';

export default class Modal {
  constructor(options = {}) {
    // Options should include translations, language, onSave, onDeny, onAccept, and optionally onTabChange.
    this.translations = options.translations;
    this.language = options.language;
    this.onSave = options.onSave;
    this.onDeny = options.onDeny;
    this.onAccept = options.onAccept;
    this.onTabChange = options.onTabChange;
    this.activeTab = 'consent';
    
    this.overlay = new ModalOverlay({
      onOutsideClick: (e) => {
        if (typeof this.onDeny === 'function') {
          this.onDeny();
        }
        this.hide();
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
      translations: this.translations,
      onDeny: this.onDeny,
      onSave: this.onSave,
      onAccept: this.onAccept
    });
    
    this.modalElement = null;
    this.isOpen = false;
  }
  
  render() {
    // Render tabs and actions and combine them into the content.
    const tabsElement = this.tabs.render();
    const actionsElement = this.actions.render();
    
    const innerContainer = document.createElement('div');
    innerContainer.className = 'modal-inner';
    innerContainer.appendChild(tabsElement);
    innerContainer.appendChild(actionsElement);
    
    const contentElement = this.content.render(innerContainer);
    this.modalElement = this.overlay.render(contentElement);
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
      this.modalElement.style.display = '';
      this.isOpen = false;
      document.body.style.overflow = '';
    }
  }
}