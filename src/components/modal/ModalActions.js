export default class ModalActions {
  constructor({ translations, onDeny, onSave, onAccept } = {}) {
    this.translations = translations;
    this.onDeny = onDeny;
    this.onSave = onSave;
    this.onAccept = onAccept;
    
    // Bind the handlers
    this.handleDeny = this.handleDeny.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
  }
  
  handleDeny(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof this.onDeny === 'function') {
      this.onDeny();
    }
  }
  
  handleSave(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof this.onSave === 'function') {
      this.onSave();
    }
  }
  
  handleAccept(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof this.onAccept === 'function') {
      this.onAccept();
    }
  }
  
  render() {
    const t = this.translations;
    const container = document.createElement('div');
    container.className = 'modal-actions flex gap-4 mt-4';
    
    // Deny button
    const denyButton = document.createElement('button');
    denyButton.type = 'button';
    denyButton.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
    denyButton.textContent = t.initialModal.deny;
    denyButton.setAttribute('data-action', 'deny'); // Added attribute
    denyButton.addEventListener('click', this.handleDeny);
    container.appendChild(denyButton);
    
    // Save preferences button
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
    saveButton.textContent = t.initialModal.allowSelection;
    saveButton.setAttribute('data-action', 'save'); // Added attribute
    saveButton.addEventListener('click', this.handleSave);
    container.appendChild(saveButton);
    
    // Accept all button
    const acceptButton = document.createElement('button');
    acceptButton.type = 'button';
    acceptButton.className = 'flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700';
    acceptButton.textContent = t.initialModal.allowAll;
    acceptButton.setAttribute('data-action', 'accept'); // Added attribute
    acceptButton.addEventListener('click', this.handleAccept);
    container.appendChild(acceptButton);
    
    return container;
  }
}