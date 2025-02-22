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
    console.log("ModalActions: handleDeny triggered", event);
    event.preventDefault();
    event.stopPropagation();
    if (typeof this.onDeny === 'function') {
      console.log("ModalActions: calling onDeny callback");
      this.onDeny();
    } else {
      console.warn("ModalActions: onDeny callback is not a function");
    }
  }
  
  handleSave(event) {
    console.log("ModalActions: handleSave triggered", event);
    event.preventDefault();
    event.stopPropagation();
    if (typeof this.onSave === 'function') {
      console.log("ModalActions: calling onSave callback");
      this.onSave();
    } else {
      console.warn("ModalActions: onSave callback is not a function");
    }
  }
  
  handleAccept(event) {
    console.log("ModalActions: handleAccept triggered", event);
    event.preventDefault();
    event.stopPropagation();
    if (typeof this.onAccept === 'function') {
      console.log("ModalActions: calling onAccept callback");
      this.onAccept();
    } else {
      console.warn("ModalActions: onAccept callback is not a function");
    }
  }
  
  render() {
    const t = this.translations;
    const container = document.createElement('div');
    container.className = 'modal-actions flex gap-4 mt-4';
    
    // Add a capturing listener on the container to log clicks from any child
    container.addEventListener('click', (e) => {
      console.log("ModalActions container capturing click event:", e.target);
    }, true);
    
    // Utility function to attach both capture and bubble listeners,
    // plus add an inline onclick attribute for debugging.
    const attachListeners = (button, handler, phaseName) => {
      // Add capturing listener
      button.addEventListener('click', handler, { capture: true });
      // Add bubbling listener
      button.addEventListener('click', handler, { capture: false });
      // Also add an inline attribute (for debugging only)
      button.setAttribute('onclick', `console.log('Inline handler on ${phaseName} button triggered');`);
    };
    
    // Deny button
    const denyButton = document.createElement('button');
    denyButton.type = 'button';
    denyButton.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
    denyButton.textContent = t.initialModal.deny;
    denyButton.setAttribute('data-action', 'deny');
    attachListeners(denyButton, this.handleDeny, "Deny");
    container.appendChild(denyButton);
    
    // Save preferences button
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
    saveButton.textContent = t.initialModal.allowSelection;
    saveButton.setAttribute('data-action', 'save');
    attachListeners(saveButton, this.handleSave, "Save");
    container.appendChild(saveButton);
    
    // Accept all button
    const acceptButton = document.createElement('button');
    acceptButton.type = 'button';
    acceptButton.className = 'flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700';
    acceptButton.textContent = t.initialModal.allowAll;
    acceptButton.setAttribute('data-action', 'accept');
    attachListeners(acceptButton, this.handleAccept, "Accept");
    container.appendChild(acceptButton);
    
    console.log("ModalActions: Rendered action buttons", container);
    return container;
  }
}