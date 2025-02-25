export default class ModalContent {
  render(innerContent) {
    const content = document.createElement('div');
    content.className = 'modal-content relative bg-white rounded-lg w-full max-w-2xl mx-4';
    
    // Set fixed max-height and overflow handling
    content.style.maxHeight = '80vh';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    
    // Create a scrollable container for the inner content
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'modal-scroll-container';
    scrollContainer.style.overflowY = 'auto';
    scrollContainer.style.flex = '1 1 auto';
    scrollContainer.style.padding = '1rem';
    
    // innerContent can be a string (HTML) or a DOM element
    if (typeof innerContent === 'string') {
      scrollContainer.innerHTML = innerContent;
    } else if (innerContent instanceof HTMLElement) {
      scrollContainer.appendChild(innerContent);
    }
    
    content.appendChild(scrollContainer);
    return content;
  }
}