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
        console.log("ModalOverlay: Outside click detected", e);
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
        if (typeof this.onDeny === 'function') {
          this.onDeny();
        }
        this.hide();
      },
      onSave: () => {
        console.log("ModalActions: Save clicked");
        if (typeof this.onSave === 'function') {
          this.onSave();
        }
        this.hide();
      },
      onAccept: () => {
        console.log("ModalActions: Accept clicked");
        if (typeof this.onAccept === 'function') {
          this.onAccept();
        }
        this.hide();
      }
    });
    
    this.modalElement = null;
    this.isOpen = false;
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
    
    // Attach a MutationObserver if debugging is enabled to detect re-rendering
    if (window.DEBUG) {
      const observer = new MutationObserver((mutationsList) => {
        console.log("Modal MutationObserver: mutations detected:", mutationsList);
      });
      observer.observe(this.modalElement, { attributes: true, childList: true, subtree: true });
    }
    
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
    console.log("Modal: show() called, before update", {
      classList: Array.from(this.modalElement.classList),
      inlineDisplay: this.modalElement.style.display,
      computedDisplay: window.getComputedStyle(this.modalElement).display
    });
    this.modalElement.classList.remove('hidden');
    this.modalElement.style.display = 'flex';
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    console.log("Modal: show() updated", {
      classList: Array.from(this.modalElement.classList),
      inlineDisplay: this.modalElement.style.display,
      computedDisplay: window.getComputedStyle(this.modalElement).display
    });
  }
  
  hide() {
    if (this.modalElement) {
      console.log("Modal: hide() called, before update", {
        classList: Array.from(this.modalElement.classList),
        inlineDisplay: this.modalElement.style.display,
        computedDisplay: window.getComputedStyle(this.modalElement).display
      });
      this.modalElement.classList.add('hidden');
      this.modalElement.style.display = 'none';
      this.isOpen = false;
      document.body.style.overflow = '';
      console.log("Modal: hide() updated", {
        classList: Array.from(this.modalElement.classList),
        inlineDisplay: this.modalElement.style.display,
        computedDisplay: window.getComputedStyle(this.modalElement).display
      });
    }
  }
  
  switchToTab(tabId) {
    if (this.tabs && typeof this.tabs.switchTab === 'function') {
      this.tabs.switchTab(tabId);
    }
  }
}