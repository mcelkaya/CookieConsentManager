import { safeObjectAccess } from './safeObjectAccess';

const VALID_EVENTS = Object.freeze({
  click: 'click',
  change: 'change',
  submit: 'submit',
  focus: 'focus',
  blur: 'blur',
  mouseenter: 'mouseenter',
  mouseleave: 'mouseleave',
  keyup: 'keyup',
  keydown: 'keydown'
});

const VALID_ELEMENTS = Object.freeze({
  BUTTON: 'BUTTON',
  INPUT: 'INPUT',
  A: 'A',
  SELECT: 'SELECT',
  LABEL: 'LABEL',
  DIV: 'DIV',
  SPAN: 'SPAN',
  P: 'P',
  H2: 'H2',
  NAV: 'NAV'
});

class RateLimiter {
  constructor(delay = 100, maxCalls = 10) {
    this.delay = delay;
    this.maxCalls = maxCalls;
    this.timestamps = new WeakMap();
    this.callCounts = new WeakMap();
  }

  isAllowed(element) {
    if (!element || !(element instanceof Element)) {
      return false;
    }

    const now = Date.now();
    const lastCall = this.timestamps.get(element) || 0;
    const currentCount = this.callCounts.get(element) || 0;

    if (now - lastCall < this.delay || currentCount >= this.maxCalls) {
      return false;
    }

    this.timestamps.set(element, now);
    this.callCounts.set(element, currentCount + 1);

    setTimeout(() => {
      const count = this.callCounts.get(element);
      if (count > 0) {
        this.callCounts.set(element, count - 1);
      }
    }, this.delay);

    return true;
  }
}

const globalRateLimiter = new RateLimiter();

const isValidEventName = (eventName) => {
  if (typeof eventName !== 'string') return false;
  return safeObjectAccess(VALID_EVENTS, eventName) !== null;
};

const isValidEventTarget = (target) => {
  if (!target?.tagName) return false;
  const tagName = target.tagName.toUpperCase();
  return safeObjectAccess(VALID_ELEMENTS, tagName) !== null;
};

const createSafeHandler = (handler, element) => {
  return (event) => {
    try {
      if (!globalRateLimiter.isAllowed(element)) {
        return;
      }

      const eventType = safeObjectAccess(VALID_EVENTS, event.type);
      if (eventType && ['click', 'submit'].includes(eventType)) {
        event.preventDefault();
      }

      if (!isValidEventTarget(event.target)) {
        return;
      }

      handler(event);
    } catch (error) {
      console.error('Error in event handler:', error);
    }
  };
};

export const addEventListeners = (element, events) => {
  if (!element || typeof element.addEventListener !== 'function') {
    console.error('Invalid element provided to addEventListeners');
    return;
  }

  if (!events || typeof events !== 'object') {
    console.error('Invalid events object provided');
    return;
  }

  Object.entries(events)
    .filter(([eventName]) => isValidEventName(eventName))
    .forEach(([eventName, handler]) => {
      if (typeof handler !== 'function') {
        console.error(`Invalid handler for event: ${eventName}`);
        return;
      }

      const safeHandler = createSafeHandler(handler, element);
      element.addEventListener(eventName, safeHandler, { passive: false });
    });
};

export const removeEventListeners = (element, events) => {
  if (!element || typeof element.removeEventListener !== 'function') {
    return;
  }
  
  if (!events || typeof events !== 'object') {
    return;
  }

  Object.entries(events)
    .filter(([eventName]) => isValidEventName(eventName))
    .forEach(([eventName, handler]) => {
      if (typeof handler === 'function') {
        element.removeEventListener(eventName, handler);
      }
    });
};

export const delegateEvent = (element, eventName, selector, handler) => {
  if (!element || !isValidEventName(eventName)) {
    console.error('Invalid parameters for event delegation');
    return;
  }

  if (typeof selector !== 'string' || !selector.trim()) {
    console.error('Invalid selector for event delegation');
    return;
  }

  if (typeof handler !== 'function') {
    console.error('Invalid handler for event delegation');
    return;
  }

  const delegatedHandler = (event) => {
    try {
      if (!globalRateLimiter.isAllowed(element)) {
        return;
      }

      const target = event.target.closest(selector);
      if (target && element.contains(target)) {
        const eventType = safeObjectAccess(VALID_EVENTS, event.type);
        if (eventType && ['click', 'submit'].includes(eventType)) {
          event.preventDefault();
        }

        if (isValidEventTarget(target)) {
          const safeEvent = {
            type: event.type,
            target,
            currentTarget: element,
            preventDefault: () => event.preventDefault(),
            stopPropagation: () => event.stopPropagation()
          };
          
          handler(safeEvent, target);
        }
      }
    } catch (error) {
      console.error('Error in delegated event handler:', error);
    }
  };

  element.addEventListener(eventName, delegatedHandler, { passive: false });
  
  // Return cleanup function
  return () => {
    element.removeEventListener(eventName, delegatedHandler);
  };
};

// Safe event data handling
export const createSafeEventData = (data) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  return Object.entries(data).reduce((safe, [key, value]) => {
    // Only allow string values and basic types
    if (typeof value === 'string') {
      safe[key] = value
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    } else if (['number', 'boolean'].includes(typeof value)) {
      safe[key] = value;
    }
    return safe;
  }, {});
};

// Custom event creation with safety checks
export const createSafeCustomEvent = (eventName, detail = {}) => {
  if (!isValidEventName(eventName)) {
    console.error('Invalid custom event name');
    return null;
  }

  const safeDetail = createSafeEventData(detail);
  
  try {
    return new CustomEvent(eventName, {
      detail: safeDetail,
      bubbles: true,
      cancelable: true
    });
  } catch (error) {
    console.error('Error creating custom event:', error);
    return null;
  }
};

export default {
  addEventListeners,
  removeEventListeners,
  delegateEvent,
  createSafeCustomEvent,
  isValidEventName,
  isValidEventTarget
};