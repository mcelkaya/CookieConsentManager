import { addEventListeners } from '../utils/events';
import { safeQuerySelector } from '../utils/dom';
import { validateData, isValidUrl } from '../utils/security';

// Embed a base64 cookie icon to avoid external image loading issues
const COOKIE_ICON_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABQElEQVR4nO3UMUvDUBQF4ENpB8HJTReho4ODm4OLk1MR/Q2Ci4vgIji7OfoTHFwcHRwc9Qc4OjiITg7Fxa5KkahJFfNarI29ITHmJRUXvXA5j/ty7uUlvJvJGKxUOdDTI9lSaSdq3vf/Dlgql/3BXO5zwfMurVaWLdWtBmQhUNbtPR0Lr1RqLXjeRe73HwC0Wq2Mx+23wW7I2yEfhTwc8jgoxNMrpFVAG6kVA1CBQjQ+sDXgWXLh+DuQ9XtxgQYUJedZDSDiOAT4yexM8FtSXQWawVl2XwHr6kJVv0LgPW6SjQ6sJ0/bCEDhyaYYD/gXVXQFbM7MLNr+gx1VXZiamvSB3cz3+lhvW08K0Ov1hrLZ7PvExPi11vo0arbb7UG8PsC5UurILZRKpQbjnNVqNYfPBxpEVo7jnItI3MUxZAPRF5+aLpMjqQClAAAAAElFTkSuQmCC";

const BUTTON_CONFIG = Object.freeze({
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
    const button = document.createElement('button');
    button.id = BUTTON_CONFIG.BUTTON_ID;
    button.className = 'fixed bottom-4 left-4 p-3 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 z-[9998]';
    button.setAttribute('aria-label', 'Cookie Preferences');
    button.setAttribute('type', 'button');

    const img = document.createElement('img');
    // Use embedded base64 image instead of external URL
    img.src = COOKIE_ICON_BASE64;
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