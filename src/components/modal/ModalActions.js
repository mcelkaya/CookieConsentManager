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
    container.className = 'modal-actions flex gap-4 p-4 border-t';
    
    // Make sure buttons always stay at the bottom of the modal
    container.style.position = 'sticky';
    container.style.bottom = '0';
    container.style.backgroundColor = 'white';
    container.style.zIndex = '10';
    
    // Deny button
    const denyButton = document.createElement('button');
    denyButton.type = 'button';
    denyButton.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
    denyButton.textContent = t.initialModal?.deny || 'Deny';
    denyButton.setAttribute('data-action', 'deny');
    
    // Multiple event bindings for maximum compatibility
    denyButton.addEventListener('click', this.handleDeny, true);
    denyButton.onclick = this.handleDeny;
    container.appendChild(denyButton);
    
    // Save preferences button
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
    saveButton.textContent = t.initialModal?.allowSelection || 'Allow Selection';
    saveButton.setAttribute('data-action', 'save');
    
    // Multiple event bindings for maximum compatibility
    saveButton.addEventListener('click', this.handleSave, true);
    saveButton.onclick = this.handleSave;
    container.appendChild(saveButton);
    
    // Accept all button
    const acceptButton = document.createElement('button');
    acceptButton.type = 'button';
    acceptButton.className = 'flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700';
    acceptButton.textContent = t.initialModal?.allowAll || 'Allow All';
    acceptButton.setAttribute('data-action', 'accept');
    
    // Multiple event bindings for maximum compatibility
    acceptButton.addEventListener('click', this.handleAccept, true);
    acceptButton.onclick = this.handleAccept;
    container.appendChild(acceptButton);
    
    console.log("ModalActions: Rendered action buttons");
    return container;
  }
}