// safeObjectAccess.js

/**
 * Safely access nested object properties
 */
export const safeObjectAccess = (obj, path, defaultValue = null) => {
    if (!obj || typeof obj !== 'object') return defaultValue;
    
    try {
      const keys = Array.isArray(path) ? path : path.split('.');
      let result = obj;
      
      for (const key of keys) {
        if (result === null || typeof result !== 'object') {
          return defaultValue;
        }
        
        if (!Object.prototype.hasOwnProperty.call(result, key)) {
          return defaultValue;
        }
        
        result = result[key];
      }
      
      return result ?? defaultValue;
    } catch (error) {
      console.error('Error in safeObjectAccess:', error);
      return defaultValue;
    }
  };
  
  /**
   * Safely access array elements
   */
  export const safeArrayAccess = (array, index, defaultValue = null) => {
    if (!Array.isArray(array)) return defaultValue;
    if (typeof index !== 'number' || !Number.isInteger(index)) return defaultValue;
    if (index < 0 || index >= array.length) return defaultValue;
    
    try {
      return array[index] ?? defaultValue;
    } catch (error) {
      console.error('Error in safeArrayAccess:', error);
      return defaultValue;
    }
  };
  
  /**
   * Safely get object keys
   */
  export const safeObjectKeys = (obj) => {
    if (!obj || typeof obj !== 'object') return [];
    
    try {
      return Object.keys(obj);
    } catch (error) {
      console.error('Error in safeObjectKeys:', error);
      return [];
    }
  };
  
  /**
   * Safely get object entries
   */
  export const safeObjectEntries = (obj) => {
    if (!obj || typeof obj !== 'object') return [];
    
    try {
      return Object.entries(obj);
    } catch (error) {
      console.error('Error in safeObjectEntries:', error);
      return [];
    }
  };
  
  /**
   * Safely check if an object has a property
   */
  export const safeHasProperty = (obj, prop) => {
    if (!obj || typeof obj !== 'object' || typeof prop !== 'string') return false;
    
    try {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    } catch (error) {
      console.error('Error in safeHasProperty:', error);
      return false;
    }
  };
  
  /**
   * Safely merge objects
   */
  export const safeMergeObjects = (...objects) => {
    try {
      const safeObjects = objects.filter(obj => obj && typeof obj === 'object');
      return Object.assign({}, ...safeObjects);
    } catch (error) {
      console.error('Error in safeMergeObjects:', error);
      return {};
    }
  };