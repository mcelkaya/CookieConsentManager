export default class ModalContent {
    render(innerContent) {
      const content = document.createElement('div');
      content.className = 'modal-content relative bg-white rounded-lg w-full max-w-2xl mx-4';
      // innerContent can be a string (HTML) or a DOM element.
      if (typeof innerContent === 'string') {
        content.innerHTML = innerContent;
      } else if (innerContent instanceof HTMLElement) {
        content.appendChild(innerContent);
      }
      return content;
    }
  }
  