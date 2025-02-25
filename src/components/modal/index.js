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
    
    this.overlay = new ModalOverlay({
      onOutsideClick: (e) => {
        console.log("ModalOverlay: Outside click detected");
        if (e.target.id === 'cookie-consent-modal') {
          this.handleDeny();
        }
      }
    });
    
    this.content = new ModalContent();
    this.tabs = new ModalTabs({
      translations: this.translations,
      activeTab: this.activeTab,
      onTabChange: (tab) => {
        console.log("ModalTabs: Tab changed", tab);
        this.activeTab = tab;
        if (typeof this.onTabChange === 'function') {
          this.onTabChange(tab);
        }
      }
    });
    
    this.actions = new ModalActions({
      translations: this.translations,
      onDeny: () => {
        console.log("ModalActions: Deny clicked");
        this.handleDeny();
      },
      onSave: () => {
        console.log("ModalActions: Save clicked");
        this.handleSave();
      },
      onAccept: () => {
        console.log("ModalActions: Accept clicked");
        this.handleAccept();
      }
    });
    
    this.modalElement = null;
    this.isOpen = false;
  }
  
  handleDeny() {
    console.log("Modal: handleDeny called");
    try {
      if (typeof this.onDeny === 'function') {
        this.onDeny();
      }
    } catch (error) {
      console.error("Error in onDeny callback:", error);
    }
    this.forceHide();
  }
  
  handleSave() {
    console.log("Modal: handleSave called");
    try {
      if (typeof this.onSave === 'function') {
        this.onSave();
      }
    } catch (error) {
      console.error("Error in onSave callback:", error);
    }
    this.forceHide();
  }
  
  handleAccept() {
    console.log("Modal: handleAccept called");
    try {
      if (typeof this.onAccept === 'function') {
        this.onAccept();
      }
    } catch (error) {
      console.error("Error in onAccept callback:", error);
    }
    this.forceHide();
  }
  
  render() {
    const tabsElement = this.tabs.render();
    const actionsElement = this.actions.render();
    
    const innerContainer = document.createElement('div');
    innerContainer.className = 'modal-inner';
    innerContainer.appendChild(tabsElement);
    innerContainer.appendChild(actionsElement);
    
    const contentElement = this.content.render(innerContainer);
    this.modalElement = this.overlay.render(contentElement);
    
    // Debug click logging on the modal element
    if (window.DEBUG) {
      this.modalElement.addEventListener('click', (e) => {
        console.log('Modal: Click event', {
          target: e.target,
          targetType: e.target.tagName,
          callbacks: {
            onDeny: typeof this.onDeny === 'function',
            onSave: typeof this.onSave === 'function',
            onAccept: typeof this.onAccept === 'function'
          }
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
    console.log("Modal: show() called");
    
    this.modalElement.classList.remove('hidden');
    this.modalElement.style.display = 'flex';
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Add direct click handlers to buttons after rendering
    this.addDirectActionHandlers();
  }
  
  hide() {
    if (this.modalElement) {
      console.log("Modal: hide() called");
      this.modalElement.classList.add('hidden');
      this.modalElement.style.display = 'none';
      this.isOpen = false;
      document.body.style.overflow = '';
    }
  }
  
  // Force hide that will always work
  forceHide() {
    if (this.modalElement) {
      console.log("Modal: forceHide() called");
      this.modalElement.classList.add('hidden');
      this.modalElement.style.display = 'none';
      this.isOpen = false;
      document.body.style.overflow = '';
    }
  }
  
  // Add direct click handlers to buttons as a fallback
  addDirectActionHandlers() {
    setTimeout(() => {
      if (!this.modalElement) return;
      
      // Find all action buttons
      const denyButton = this.modalElement.querySelector('[data-action="deny"]');
      const saveButton = this.modalElement.querySelector('[data-action="save"]');
      const acceptButton = this.modalElement.querySelector('[data-action="accept"]');
      
      // Add direct handlers
      if (denyButton) {
        denyButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleDeny();
          return false;
        };
      }
      
      if (saveButton) {
        saveButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleSave();
          return false;
        };
      }
      
      if (acceptButton) {
        acceptButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleAccept();
          return false;
        };
      }
      
      console.log("Direct action handlers added to buttons");
    }, 100);
  }
  
  switchToTab(tabId) {
    if (this.tabs && typeof this.tabs.switchTab === 'function') {
      this.tabs.switchTab(tabId);
    }
  }
}