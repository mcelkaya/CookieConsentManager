import { addEventListeners } from '../utils/events';
import { safeQuerySelector } from '../utils/dom';
import { validateData, isValidUrl } from '../utils/security';

const BUTTON_CONFIG = Object.freeze({
  IMAGE_URL: 'https://cdn.prod.website-files.com/66b910f38e21190c26a4f750/67a9e96a9693f6e9f54a8d81_cookie.png',
  BUTTON_ID: 'cookie-preferences-button',
  WRAPPER_CLASS: 'cookie-preferences-button-wrapper'
});

export default class PreferencesButton {
  constructor(options = {}) {
    const optionsSchema = {
      onClick: { type: 'function', required: true }
    };

    if (!validateData(options, optionsSchema)) {
      throw new Error('Invalid PreferencesButton configuration');
    }

    this.onClick = options.onClick;
    this.handleClick = this.handleClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  init() {
    try {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = BUTTON_CONFIG.WRAPPER_CLASS;
      
      const buttonElement = this.createButtonElement();
      if (!buttonElement) {
        throw new Error('Failed to create preferences button');
      }
      
      buttonContainer.appendChild(buttonElement);
      document.body.appendChild(buttonContainer);
      this.addEventListeners();
    } catch (error) {
      console.error('Failed to initialize preferences button:', error);
    }
  }

  createButtonElement() {
    if (!isValidUrl(BUTTON_CONFIG.IMAGE_URL)) {
      console.error('Invalid image URL');
      return null;
    }

    const button = document.createElement('button');
    button.id = BUTTON_CONFIG.BUTTON_ID;
    button.className = 'fixed bottom-4 left-4 p-3 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 z-[9998]';
    button.setAttribute('aria-label', 'Cookie Preferences');
    button.setAttribute('type', 'button');

    const img = document.createElement('img');
    img.src = BUTTON_CONFIG.IMAGE_URL;
    img.alt = 'Cookie Preferences';
    img.width = 24;
    img.height = 24;
    img.setAttribute('loading', 'lazy');

    button.appendChild(img);
    return button;
  }

  addEventListeners() {
    const button = safeQuerySelector(`#${BUTTON_CONFIG.BUTTON_ID}`);
    if (!button) {
      console.error('Preferences button not found');
      return;
    }

    addEventListeners(button, {
      click: this.handleClick,
      keydown: this.handleKeydown
    });
  }

  handleClick(event) {
    try {
      event.preventDefault();
      const button = event.target.closest(`#${BUTTON_CONFIG.BUTTON_ID}`);
      if (button) {
        this.onClick();
      }
    } catch (error) {
      console.error('Error handling preferences button click:', error);
    }
  }

  handleKeydown(event) {
    try {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.handleClick(event);
      }
    } catch (error) {
      console.error('Error handling preferences button keydown:', error);
    }
  }

  destroy() {
    try {
      const button = safeQuerySelector(`#${BUTTON_CONFIG.BUTTON_ID}`);
      if (button) {
        button.removeEventListener('click', this.handleClick);
        button.removeEventListener('keydown', this.handleKeydown);
        
        const wrapper = button.closest(`.${BUTTON_CONFIG.WRAPPER_CLASS}`);
        if (wrapper) {
          wrapper.remove();
        }
      }
    } catch (error) {
      console.error('Error destroying preferences button:', error);
    }
  }
}