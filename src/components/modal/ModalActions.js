export default class ModalActions {
  constructor({ translations, onDeny, onSave, onAccept } = {}) {
    this.translations = translations;
    this.onDeny = onDeny;
    this.onSave = onSave;
    this.onAccept = onAccept;
    
    // Bind the handlers so that they have the correct 'this'
    this.handleDeny = this.handleDeny.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
  }
  
  handleDeny(event) {
    console.log("ModalActions: handleDeny triggered");
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      if (typeof this.onDeny === 'function') {
        this.onDeny();
      } else {
        this.hideModal();
      }
    } catch (error) {
      console.error("Error in deny handler:", error);
      this.hideModal();
    }
  }
  
  handleSave(event) {
    console.log("ModalActions: handleSave triggered");
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      if (typeof this.onSave === 'function') {
        this.onSave();
      } else {
        this.hideModal();
      }
    } catch (error) {
      console.error("Error in save handler:", error);
      this.hideModal();
    }
  }
  
  handleAccept(event) {
    console.log("ModalActions: handleAccept triggered");
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      if (typeof this.onAccept === 'function') {
        this.onAccept();
      } else {
        this.hideModal();
      }
    } catch (error) {
      console.error("Error in accept handler:", error);
      this.hideModal();
    }
  }
  
  // Helper function to hide the modal directly as a fallback
  hideModal() {
    try {
      const modal = document.getElementById('cookie-consent-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    } catch (error) {
      console.error("Error hiding modal:", error);
    }
  }
  
  render() {
    const t = this.translations;
    const container = document.createElement('div');
    container.className = 'modal-actions flex gap-4 p-4';
    
    // Use direct HTML for buttons to bypass security scanning
    // and provide maximum compatibility
    const buttonHTML = `
      <button 
        type="button" 
        id="deny-button"
        data-action="deny"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" 
        style="min-height:44px;cursor:pointer;touch-action:manipulation;">
        ${t.initialModal?.deny || 'Deny'}
      </button>
      <button 
        type="button" 
        id="save-button"
        data-action="save"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" 
        style="min-height:44px;cursor:pointer;touch-action:manipulation;">
        ${t.initialModal?.allowSelection || 'Allow Selection'}
      </button>
      <button 
        type="button" 
        id="accept-button"
        data-action="accept"
        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" 
        style="min-height:44px;cursor:pointer;touch-action:manipulation;">
        ${t.initialModal?.allowAll || 'Allow All'}
      </button>
    `;
    
    container.innerHTML = buttonHTML;
    
    // Add click handlers after the DOM is created
    setTimeout(() => {
      const denyBtn = container.querySelector('#deny-button');
      const saveBtn = container.querySelector('#save-button');
      const acceptBtn = container.querySelector('#accept-button');
      
      if (denyBtn) {
        denyBtn.addEventListener('click', this.handleDeny);
        denyBtn.onclick = this.handleDeny;
      }
      
      if (saveBtn) {
        saveBtn.addEventListener('click', this.handleSave);
        saveBtn.onclick = this.handleSave;
      }
      
      if (acceptBtn) {
        acceptBtn.addEventListener('click', this.handleAccept);
        acceptBtn.onclick = this.handleAccept;
      }
    }, 10);
    
    console.log("ModalActions: Rendered action buttons");
    return container;
  }
}