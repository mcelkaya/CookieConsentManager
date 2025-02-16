/* eslint-disable security/detect-object-injection */
import DOMPurify from 'dompurify';

const SUPPORTED_LANGUAGES = {
  en: 'en',
  fr: 'fr',
  tr: 'tr'
};

const REQUIRED_TRANSLATION_KEYS = {
  tabs: ['consent', 'details', 'about'],
  initialModal: ['title', 'description', 'deny', 'allowSelection', 'allowAll'],
  cookieTypes: ['necessary', 'preferences', 'statistics', 'marketing'],
  about: ['intro', 'legal', 'usage', 'changeConsent', 'cookieDeclaration', 'privacy', 'consentId']
};

export class LanguageManager {
  constructor(translations) {
    this.defaultLanguage = SUPPORTED_LANGUAGES.en;
    this.translations = this.validateTranslations(translations);
  }

  validateTranslations(translations) {
    if (!translations || typeof translations !== 'object') {
      console.error('Invalid translations object provided');
      return { [this.defaultLanguage]: {} };
    }
    const validatedTranslations = {};
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
      if (Object.prototype.hasOwnProperty.call(translations, lang) && typeof translations[lang] === 'object') {
        validatedTranslations[lang] = this.validateTranslationStructure(translations[lang]);
      }
    });
    if (!validatedTranslations[this.defaultLanguage]) {
      validatedTranslations[this.defaultLanguage] = {};
    }
    return Object.freeze(validatedTranslations);
  }

  validateTranslationStructure(translation) {
    const validated = {};
    Object.keys(REQUIRED_TRANSLATION_KEYS).forEach(section => {
      if (Object.prototype.hasOwnProperty.call(translation, section)) {
        const requiredKeys = REQUIRED_TRANSLATION_KEYS[section];
        validated[section] = {};
        requiredKeys.forEach(key => {
          if (translation[section] && Object.prototype.hasOwnProperty.call(translation[section], key)) {
            // eslint-disable-next-line xss/no-mixed-html
            validated[section][key] = this.sanitizeTranslationValue(translation[section][key]);
          }
        });
      }
    });
    return Object.freeze(validated);
  }

  detectLanguage() {
    try {
      let browserLang = '';
      if (navigator && navigator.language) {
        browserLang = navigator.language.split('-')[0].toLowerCase();
      }
      return Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, browserLang) ? browserLang : this.defaultLanguage;
    } catch (error) {
      console.error('Failed to detect language:', error);
      return this.defaultLanguage;
    }
  }

  getTranslation(language, key) {
    try {
      if (!key || typeof key !== 'string') return '';
      const validLanguage = Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, language) ? language : this.defaultLanguage;
      const translationObj = (this.translations && this.translations[validLanguage]) ||
                             (this.translations && this.translations[this.defaultLanguage]);
      return this.getNestedValue(translationObj, key.split('.')) || key;
    } catch (error) {
      console.error(`Failed to get translation for key: ${key}`, error);
      return key;
    }
  }

  getNestedValue(obj, path) {
    try {
      return path.reduce((acc, cur) => (acc && acc[cur] !== undefined ? acc[cur] : ''), obj);
    } catch (error) {
      console.error('Error accessing nested value:', error);
      return '';
    }
  }

  sanitizeTranslationValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '';
  }

  isValidLanguage(language) {
    return Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, language);
  }

  getDefaultLanguage() {
    return this.defaultLanguage;
  }

  getSupportedLanguages() {
    return Object.keys(SUPPORTED_LANGUAGES);
  }
}
/* eslint-enable security/detect-object-injection */