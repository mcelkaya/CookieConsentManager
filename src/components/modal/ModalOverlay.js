export default class ModalOverlay {
    constructor({ onOutsideClick } = {}) {
      this.onOutsideClick = onOutsideClick;
    }
    
    render(contentElement) {
      const overlay = document.createElement('div');
      overlay.className =
        'modal-overlay fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center pointer-events-auto';
      // When a click occurs on the overlay itself (and not on its children), treat it as an outside click.
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          if (typeof this.onOutsideClick === 'function') {
            this.onOutsideClick(e);
          }
        }
      });
      overlay.appendChild(contentElement);
      return overlay;
    }
  }