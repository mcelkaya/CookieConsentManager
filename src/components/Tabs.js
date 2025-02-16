import { addEventListeners } from '../utils/events';
import { validateData } from '../utils/security';
import { safeQuerySelector, setSafeAttribute, toggleClass } from '../utils/dom';

const VALID_TAB_IDS = ['consent', 'details', 'about'];
const VALID_TABS = {
  consent: 'consent',
  details: 'details',
  about: 'about'
};

const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab'
};

export default class Tabs {
  constructor(options = {}) {
    const optionsSchema = {
      onTabChange: { type: 'function', required: true }
    };

    if (!validateData(options, optionsSchema)) {
      throw new Error('Invalid Tabs configuration');
    }

    this.activeTab = 'consent';
    this.onTabChange = options.onTabChange;
    this.tabs = new Map();
    
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleKeyboardNavigation = this.handleKeyboardNavigation.bind(this);
  }

  init() {
    try {
      this.setupTabs();
      this.setupEventListeners();
      this.updateAriaAttributes();
    } catch (error) {
      console.error('Failed to initialize tabs:', error);
    }
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      const tabId = button.dataset.tab;
      if (VALID_TAB_IDS.includes(tabId)) {
        this.tabs.set(tabId, button);
      }
    });
  }

  setupEventListeners() {
    this.tabs.forEach(button => {
      addEventListeners(button, {
        click: this.handleTabClick,
        keydown: this.handleKeyboardNavigation
      });
    });
  }

  handleTabClick(event) {
    try {
      event.preventDefault();
      const button = event.target.closest('.tab-button');
      if (!button) return;
      const tabId = button.dataset.tab;
      if (VALID_TAB_IDS.includes(tabId)) {
        this.switchTab(tabId);
      }
    } catch (error) {
      console.error('Error handling tab click:', error);
    }
  }

  handleKeyboardNavigation(event) {
    try {
      const button = event.target.closest('.tab-button');
      if (!button) return;
      const tabsArray = Array.from(this.tabs.values());
      const currentIndex = tabsArray.indexOf(button);
      if (currentIndex === -1) return;
      let targetIndex = currentIndex;
      let preventDefault = true;

      switch (event.key) {
        case KEYS.LEFT:
        case KEYS.UP:
          targetIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
          break;
        case KEYS.RIGHT:
        case KEYS.DOWN:
          targetIndex = (currentIndex + 1) % tabsArray.length;
          break;
        case KEYS.HOME:
          targetIndex = 0;
          break;
        case KEYS.END:
          targetIndex = tabsArray.length - 1;
          break;
        default:
          preventDefault = false;
          return;
      }

      if (preventDefault) {
        event.preventDefault();
        const targetButton = tabsArray[targetIndex];
        const targetTabId = targetButton.dataset.tab;
        if (VALID_TAB_IDS.includes(targetTabId)) {
          targetButton.focus();
          this.switchTab(targetTabId);
        }
      }
    } catch (error) {
      console.error('Error handling keyboard navigation:', error);
    }
  }

  switchTab(tabId) {
    if (!VALID_TAB_IDS.includes(tabId) || tabId === this.activeTab) {
      return;
    }
    try {
      this.activeTab = tabId;
      this.updateTabStates();
      this.updatePanelStates();
      this.updateAriaAttributes();
      if (this.onTabChange) {
        this.onTabChange(tabId);
      }
    } catch (error) {
      console.error('Error switching tabs:', error);
    }
  }

  updateTabStates() {
    this.tabs.forEach((button, id) => {
      const isActive = id === this.activeTab;
      toggleClass(button, 'active', isActive);
      setSafeAttribute(button, 'aria-selected', String(isActive));
      setSafeAttribute(button, 'tabindex', isActive ? '0' : '-1');
    });
  }

  updatePanelStates() {
    document.querySelectorAll('.tab-content').forEach(panel => {
      const panelId = panel.id.replace('-tab', '');
      const isActive = panelId === this.activeTab;
      toggleClass(panel, 'hidden', !isActive);
      setSafeAttribute(panel, 'aria-hidden', String(!isActive));
    });
  }

  updateAriaAttributes() {
    try {
      const tabList = safeQuerySelector('[role="tablist"]');
      if (!tabList) return;
      setSafeAttribute(tabList, 'aria-orientation', 'horizontal');
      this.tabs.forEach((button, id) => {
        setSafeAttribute(button, 'role', 'tab');
        setSafeAttribute(button, 'aria-controls', `${id}-tab`);
      });
      document.querySelectorAll('.tab-content').forEach(panel => {
        setSafeAttribute(panel, 'role', 'tabpanel');
        const labelId = panel.id.replace('-tab', '');
        if (VALID_TAB_IDS.includes(labelId)) {
          setSafeAttribute(panel, 'aria-labelledby', labelId);
        }
      });
    } catch (error) {
      console.error('Error updating ARIA attributes:', error);
    }
  }

  getActiveTab() {
    return this.activeTab;
  }

  reset() {
    try {
      this.switchTab('consent');
    } catch (error) {
      console.error('Error resetting tabs:', error);
    }
  }

  destroy() {
    try {
      this.tabs.forEach(button => {
        button.removeEventListener('click', this.handleTabClick);
        button.removeEventListener('keydown', this.handleKeyboardNavigation);
      });
      this.tabs.clear();
    } catch (error) {
      console.error('Error destroying tabs:', error);
    }
  }
}