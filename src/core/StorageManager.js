/* eslint-disable xss/no-mixed-html */
const STORAGE_CONFIG = {
  KEY_PATTERN: /^[a-z0-9_-]+$/i,
  MAX_KEY_LENGTH: 64,
  MAX_DATA_SIZE: 1024 * 1024,
  ENCRYPTION_ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,
  SALT_LENGTH: 16,
  IV_LENGTH: 12
};

export class StorageManager {
  constructor(key) {
    // eslint-disable-next-line xss/no-mixed-html
    this.key = this.sanitizeKey(key);
    this.crypto = window.crypto.subtle;
  }

  sanitizeKey(key) {
    if (typeof key !== 'string') return null;
    const sanitized = key.trim();
    return STORAGE_CONFIG.KEY_PATTERN.test(sanitized) && sanitized.length <= STORAGE_CONFIG.MAX_KEY_LENGTH ? sanitized : null;
  }

  async save(data) {
    if (!this.key) return false;
    try {
      const dataString = JSON.stringify(data);
      if (dataString.length > STORAGE_CONFIG.MAX_DATA_SIZE) {
        throw new Error('Data size exceeds maximum allowed');
      }
      const salt = crypto.getRandomValues(new Uint8Array(STORAGE_CONFIG.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(STORAGE_CONFIG.IV_LENGTH));
      const keyMaterial = await this._getKeyMaterial();
      const key = await this._deriveKey(keyMaterial, salt);
      const encodedData = new TextEncoder().encode(dataString);
      const encryptedData = await this.crypto.encrypt(
        { name: STORAGE_CONFIG.ENCRYPTION_ALGORITHM, iv },
        key,
        encodedData
      );
      const storedData = {
        data: this._arrayBufferToBase64(encryptedData),
        iv: this._arrayBufferToBase64(iv),
        salt: this._arrayBufferToBase64(salt),
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.key, JSON.stringify(storedData));
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  }

  async load() {
    if (!this.key) return null;
    try {
      const storedData = localStorage.getItem(this.key);
      if (!storedData) return null;
      const parsedData = JSON.parse(storedData);
      if (!this._validateStoredDataStructure(parsedData)) {
        throw new Error('Invalid data structure');
      }
      const iv = this._base64ToArrayBuffer(parsedData.iv);
      const salt = this._base64ToArrayBuffer(parsedData.salt);
      const encryptedData = this._base64ToArrayBuffer(parsedData.data);
      const keyMaterial = await this._getKeyMaterial();
      const key = await this._deriveKey(keyMaterial, salt);
      const decryptedData = await this.crypto.decrypt(
        { name: STORAGE_CONFIG.ENCRYPTION_ALGORITHM, iv },
        key,
        encryptedData
      );
      const decodedData = new TextDecoder().decode(decryptedData);
      return JSON.parse(decodedData);
    } catch (error) {
      console.error('Failed to load data:', error);
      return null;
    }
  }

  async remove() {
    if (!this.key) return false;
    try {
      localStorage.removeItem(this.key);
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  }

  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  async clearExpiredData(maxAge = 30 * 24 * 60 * 60 * 1000) {
    if (!this.key) return;
    try {
      const storedData = localStorage.getItem(this.key);
      if (!storedData) return;
      const parsedData = JSON.parse(storedData);
      const now = Date.now();
      if (now - parsedData.timestamp > maxAge) {
        await this.remove();
      }
    } catch (error) {
      console.error('Failed to clear expired data:', error);
    }
  }

  async _getKeyMaterial() {
    const encoder = new TextEncoder();
    const data = encoder.encode(this.key);
    return await this.crypto.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
  }

  async _deriveKey(keyMaterial, salt) {
    return await this.crypto.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: STORAGE_CONFIG.ENCRYPTION_ALGORITHM, length: STORAGE_CONFIG.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  _validateStoredDataStructure(data) {
    return data &&
           typeof data === 'object' &&
           typeof data.data === 'string' &&
           typeof data.iv === 'string' &&
           typeof data.salt === 'string' &&
           typeof data.timestamp === 'number' &&
           typeof data.version === 'string';
  }

  _arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
  }

  _base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
/* eslint-enable xss/no-mixed-html */