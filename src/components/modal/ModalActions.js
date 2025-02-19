export default class ModalActions {
    constructor({ translations, onDeny, onSave, onAccept } = {}) {
      this.translations = translations;
      this.onDeny = onDeny;
      this.onSave = onSave;
      this.onAccept = onAccept;
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
      denyButton.setAttribute('data-action', 'deny');
      container.appendChild(denyButton);
      
      // Save preferences button
      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.className = 'flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50';
      saveButton.textContent = t.initialModal.allowSelection;
      saveButton.setAttribute('data-action', 'save');
      container.appendChild(saveButton);
      
      // Accept all button
      const acceptButton = document.createElement('button');
      acceptButton.type = 'button';
      acceptButton.className = 'flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700';
      acceptButton.textContent = t.initialModal.allowAll;
      acceptButton.setAttribute('data-action', 'accept');
      container.appendChild(acceptButton);
      
      return container;
    }
}