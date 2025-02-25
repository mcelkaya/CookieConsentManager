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
      console.log("Executing denial handler");
      if (typeof this.onDeny === 'function') {
        this.onDeny();
      }
    } catch (error) {
      console.error("Error in onDeny callback:", error);
    }
    console.log("Hiding modal after deny");
    this.forceHide();
  }
  
  handleSave() {
    console.log("Modal: handleSave called");
    try {
      console.log("Executing save handler");
      if (typeof this.onSave === 'function') {
        this.onSave();
      }
    } catch (error) {
      console.error("Error in onSave callback:", error);
    }
    console.log("Hiding modal after save");
    this.forceHide();
  }
  
  handleAccept() {
    console.log("Modal: handleAccept called");
    try {
      console.log("Executing accept handler");
      if (typeof this.onAccept === 'function') {
        this.onAccept();
      }
    } catch (error) {
      console.error("Error in onAccept callback:", error);
    }
    console.log("Hiding modal after accept");
    this.forceHide();
  }
  
  render() {
    // Create a completely new structure for the modal
    const modalContainer = document.createElement('div');
    modalContainer.className = 'cookie-modal-container';
    modalContainer.style.display = 'flex';
    modalContainer.style.flexDirection = 'column';
    modalContainer.style.maxHeight = '80vh';
    modalContainer.style.width = '100%';
    modalContainer.style.maxWidth = '42rem';
    modalContainer.style.backgroundColor = 'white';
    modalContainer.style.borderRadius = '8px';
    modalContainer.style.overflow = 'hidden';
    
    // 1. Header with tabs (fixed at top)
    const headerContainer = document.createElement('div');
    headerContainer.className = 'cookie-modal-header';
    headerContainer.style.position = 'sticky';
    headerContainer.style.top = '0';
    headerContainer.style.backgroundColor = 'white';
    headerContainer.style.zIndex = '5';
    headerContainer.style.borderBottom = '1px solid #e5e7eb';
    
    const tabsElement = this.tabs.render();
    headerContainer.appendChild(tabsElement);
    modalContainer.appendChild(headerContainer);
    
    // 2. Scrollable content area
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'cookie-modal-content';
    scrollContainer.style.flexGrow = '1';
    scrollContainer.style.overflowY = 'auto';
    scrollContainer.style.padding = '1rem';
    scrollContainer.style.paddingBottom = '2rem'; // Extra padding at bottom to prevent overlap
    
    // Get the content based on active tab
    const tabContents = {};
    const tabElements = tabsElement.querySelectorAll('.tab-content');
    tabElements.forEach(element => {
      const tabId = element.id.replace('-tab', '');
      tabContents[tabId] = element;
    });
    
    // Remove tab contents from tabs element and add to scroll container
    Object.values(tabContents).forEach(content => {
      if (content.parentNode) {
        content.parentNode.removeChild(content);
      }
      scrollContainer.appendChild(content);
    });
    
    modalContainer.appendChild(scrollContainer);
    
    // 3. Footer with buttons (fixed at bottom)
    const footerContainer = document.createElement('div');
    footerContainer.className = 'cookie-modal-footer';
    footerContainer.style.position = 'sticky';
    footerContainer.style.bottom = '0';
    footerContainer.style.backgroundColor = 'white';
    footerContainer.style.zIndex = '5';
    footerContainer.style.borderTop = '1px solid #e5e7eb';
    
    const actionsElement = this.actions.render();
    footerContainer.appendChild(actionsElement);
    modalContainer.appendChild(footerContainer);
    
    // Create the final modal
    this.modalElement = this.overlay.render(modalContainer);
    
    // Debug logging for clicks
    this.modalElement.addEventListener('click', (e) => {
      console.log('Modal click event:', {
        tagName: e.target.tagName,
        className: e.target.className,
        id: e.target.id,
        dataAction: e.target.getAttribute('data-action'),
        path: e.composedPath().map(el => el.tagName || el.id || 'unknown').join(' > ')
      });
    }, true);
    
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
      
      console.log("Button elements found:", {
        denyButton: !!denyButton,
        saveButton: !!saveButton,
        acceptButton: !!acceptButton
      });
      
      // Remove existing event listeners by cloning and replacing
      if (denyButton) {
        const newDenyButton = denyButton.cloneNode(true);
        denyButton.parentNode.replaceChild(newDenyButton, denyButton);
        newDenyButton.onclick = (e) => {
          console.log("Deny button clicked directly");
          e.preventDefault();
          e.stopPropagation();
          this.handleDeny();
          return false;
        };
      }
      
      if (saveButton) {
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        newSaveButton.onclick = (e) => {
          console.log("Save button clicked directly");
          e.preventDefault();
          e.stopPropagation();
          this.handleSave();
          return false;
        };
      }
      
      if (acceptButton) {
        const newAcceptButton = acceptButton.cloneNode(true);
        acceptButton.parentNode.replaceChild(newAcceptButton, acceptButton);
        newAcceptButton.onclick = (e) => {
          console.log("Accept button clicked directly");
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
      
      // Also update the scrollable content to show the correct tab
      if (this.modalElement) {
        const tabContents = this.modalElement.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
          const contentId = content.id.replace('-tab', '');
          if (contentId === tabId) {
            content.classList.remove('hidden');
          } else {
            content.classList.add('hidden');
          }
        });
      }
    }
  }
}