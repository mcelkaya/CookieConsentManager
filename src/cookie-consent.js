// cookie-consent.js
class CookieConsentManager {
  constructor(options = {}) {
    this.domain = '.herm.io';
    this.cookieName = 'herm_cookie_consent';
    this.localStorageKey = 'herm_cookie_preferences';
    this.necessaryCookies = options.necessaryCookies || [];
    this.marketingCookies = options.marketingCookies || [];
    this.analyticsCookies = options.analyticsCookies || [];
    
    // Language support
    this.translations = {
      en: {
        title: 'Cookie Preferences',
        description: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.',
        accept: 'Accept All',
        customize: 'Customize',
        save: 'Save Preferences',
        necessary: {
          title: 'Necessary',
          description: 'Required for the website to function'
        },
        analytics: {
          title: 'Analytics',
          description: 'Help us improve our website'
        },
        marketing: {
          title: 'Marketing',
          description: 'Personalized content and ads'
        }
      },
      tr: {
        title: 'Çerez Tercihleri',
        description: 'Deneyiminizi geliştirmek için çerezleri kullanıyoruz. Bu siteyi ziyaret etmeye devam ederek çerez kullanımımızı kabul etmiş olursunuz.',
        accept: 'Tümünü Kabul Et',
        customize: 'Özelleştir',
        save: 'Tercihleri Kaydet',
        necessary: {
          title: 'Gerekli',
          description: 'Web sitesinin çalışması için gerekli'
        },
        analytics: {
          title: 'Analitik',
          description: 'Web sitemizi geliştirmemize yardımcı olun'
        },
        marketing: {
          title: 'Pazarlama',
          description: 'Kişiselleştirilmiş içerik ve reklamlar'
        }
      },
      fr: {
        title: 'Préférences des Cookies',
        description: 'Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.',
        accept: 'Tout Accepter',
        customize: 'Personnaliser',
        save: 'Enregistrer les Préférences',
        necessary: {
          title: 'Nécessaire',
          description: 'Requis pour le fonctionnement du site'
        },
        analytics: {
          title: 'Analytique',
          description: 'Aidez-nous à améliorer notre site'
        },
        marketing: {
          title: 'Marketing',
          description: 'Contenu et publicités personnalisés'
        }
      },
      de: {
        title: 'Cookie-Einstellungen',
        description: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die weitere Nutzung dieser Website stimmen Sie der Verwendung von Cookies zu.',
        accept: 'Alle Akzeptieren',
        customize: 'Anpassen',
        save: 'Einstellungen Speichern',
        necessary: {
          title: 'Notwendig',
          description: 'Erforderlich für die Funktionalität der Website'
        },
        analytics: {
          title: 'Analyse',
          description: 'Helfen Sie uns, unsere Website zu verbessern'
        },
        marketing: {
          title: 'Marketing',
          description: 'Personalisierte Inhalte und Werbung'
        }
      },
      es: {
        title: 'Preferencias de Cookies',
        description: 'Utilizamos cookies para mejorar su experiencia. Al continuar visitando este sitio, acepta nuestro uso de cookies.',
        accept: 'Aceptar Todo',
        customize: 'Personalizar',
        save: 'Guardar Preferencias',
        necessary: {
          title: 'Necesario',
          description: 'Requerido para el funcionamiento del sitio web'
        },
        analytics: {
          title: 'Analítica',
          description: 'Ayúdenos a mejorar nuestro sitio web'
        },
        marketing: {
          title: 'Marketing',
          description: 'Contenido y anuncios personalizados'
        }
      },
      it: {
        title: 'Preferenze Cookie',
        description: 'Utilizziamo i cookie per migliorare la tua esperienza. Continuando a visitare questo sito accetti il nostro utilizzo dei cookie.',
        accept: 'Accetta Tutto',
        customize: 'Personalizza',
        save: 'Salva Preferenze',
        necessary: {
          title: 'Necessari',
          description: 'Necessari per il funzionamento del sito'
        },
        analytics: {
          title: 'Analitici',
          description: 'Aiutaci a migliorare il nostro sito'
        },
        marketing: {
          title: 'Marketing',
          description: 'Contenuti e pubblicità personalizzati'
        }
      },
      pl: {
        title: 'Preferencje Cookie',
        description: 'Używamy plików cookie, aby ulepszyć Twoje doświadczenie. Kontynuując korzystanie z tej strony, zgadzasz się na używanie przez nas plików cookie.',
        accept: 'Zaakceptuj Wszystko',
        customize: 'Dostosuj',
        save: 'Zapisz Preferencje',
        necessary: {
          title: 'Niezbędne',
          description: 'Wymagane do działania strony'
        },
        analytics: {
          title: 'Analityczne',
          description: 'Pomóż nam ulepszyć naszą stronę'
        },
        marketing: {
          title: 'Marketingowe',
          description: 'Spersonalizowane treści i reklamy'
        }
      },
      pt: {
        title: 'Preferências de Cookies',
        description: 'Usamos cookies para melhorar sua experiência. Ao continuar visitando este site, você concorda com nosso uso de cookies.',
        accept: 'Aceitar Tudo',
        customize: 'Personalizar',
        save: 'Salvar Preferências',
        necessary: {
          title: 'Necessário',
          description: 'Necessário para o funcionamento do site'
        },
        analytics: {
          title: 'Analítico',
          description: 'Ajude-nos a melhorar nosso site'
        },
        marketing: {
          title: 'Marketing',
          description: 'Conteúdo e anúncios personalizados'
        }
      }
    };

    // Detect user language
    this.currentLanguage = this.detectLanguage();
    
    // Initialize banner HTML
    this.initBanner();
    this.initPreferencesButton();
    this.checkAndShowBanner();
  }

  detectLanguage() {
    // Get browser language
    const browserLang = navigator.language.split('-')[0];
    // Check if we support this language
    return this.translations[browserLang] ? browserLang : 'en';
  }

  initBanner() {
    const t = this.translations[this.currentLanguage];
    
    const bannerHtml = `
      <div id="cookie-consent-banner" class="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-[9999] hidden">
        <div class="max-w-6xl mx-auto">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex-1">
              <p class="text-gray-700">
                ${t.description}
              </p>
            </div>
            <div class="flex gap-2">
              <button id="cookie-consent-customize" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
                ${t.customize}
              </button>
              <button id="cookie-consent-accept" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded">
                ${t.accept}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="cookie-preferences-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999]">
        <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-lg w-full">
          <h2 class="text-xl font-bold mb-4">${t.title}</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">${t.necessary.title}</h3>
                <p class="text-sm text-gray-600">${t.necessary.description}</p>
              </div>
              <input type="checkbox" checked disabled>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">${t.analytics.title}</h3>
                <p class="text-sm text-gray-600">${t.analytics.description}</p>
              </div>
              <input type="checkbox" id="analytics-consent">
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">${t.marketing.title}</h3>
                <p class="text-sm text-gray-600">${t.marketing.description}</p>
              </div>
              <input type="checkbox" id="marketing-consent">
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button id="save-preferences" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded">
              ${t.save}
            </button>
          </div>
        </div>
      </div>
    `;

    // Create and append banner to body
    const bannerContainer = document.createElement('div');
    bannerContainer.innerHTML = bannerHtml;
    document.body.appendChild(bannerContainer);

    // Add event listeners
    this.addEventListeners();
  }

  addEventListeners() {
    document.getElementById('cookie-consent-accept')?.addEventListener('click', () => {
      this.acceptAll();
      this.hideBanner();
    });

    document.getElementById('cookie-consent-customize')?.addEventListener('click', () => {
      this.showPreferencesModal();
    });

    document.getElementById('save-preferences')?.addEventListener('click', () => {
      this.savePreferences();
      this.hidePreferencesModal();
      this.hideBanner();
    });
  }

  setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;domain=${this.domain};SameSite=Lax`;
  }

  getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  saveToLocalStorage(preferences) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(preferences));
  }

  getFromLocalStorage() {
    const preferences = localStorage.getItem(this.localStorageKey);
    return preferences ? JSON.parse(preferences) : null;
  }

  acceptAll() {
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };

    this.setCookie(this.cookieName, 'true');
    this.saveToLocalStorage(preferences);
    this.applyPreferences(preferences);
  }

  savePreferences() {
    const preferences = {
      necessary: true,
      analytics: document.getElementById('analytics-consent').checked,
      marketing: document.getElementById('marketing-consent').checked,
      timestamp: new Date().toISOString()
    };

    this.setCookie(this.cookieName, 'true');
    this.saveToLocalStorage(preferences);
    this.applyPreferences(preferences);
  }

  applyPreferences(preferences) {
    // Remove non-necessary cookies if not consented
    if (!preferences.analytics) {
      this.analyticsCookies.forEach(cookie => {
        this.deleteCookie(cookie);
      });
    }

    if (!preferences.marketing) {
      this.marketingCookies.forEach(cookie => {
        this.deleteCookie(cookie);
      });
    }
  }

  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${this.domain}`;
  }

  checkAndShowBanner() {
    const consentCookie = this.getCookie(this.cookieName);
    if (!consentCookie) {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        banner.style.display = 'block';
      }
    }
  }

  showPreferencesModal() {
    const preferences = this.getFromLocalStorage() || { necessary: true };
    document.getElementById('analytics-consent').checked = preferences.analytics || false;
    document.getElementById('marketing-consent').checked = preferences.marketing || false;
    document.getElementById('cookie-preferences-modal').style.display = 'block';
  }

  hidePreferencesModal() {
    document.getElementById('cookie-preferences-modal').style.display = 'none';
  }

  hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  initPreferencesButton() {
    const buttonContainer = document.createElement('div');
    buttonContainer.innerHTML = `
      <button id="cookie-preferences-button" 
              class="fixed bottom-4 left-4 p-3 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 z-[9998]"
              aria-label="Cookie Preferences">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"/>
          <path d="M15.5 7C16.3284 7 17 6.32843 17 5.5C17 4.67157 16.3284 4 15.5 4C14.6716 4 14 4.67157 14 5.5C14 6.32843 14.6716 7 15.5 7Z"/>
          <path d="M7 13.5C7.82843 13.5 8.5 12.8284 8.5 12C8.5 11.1716 7.82843 10.5 7 10.5C6.17157 10.5 5.5 11.1716 5.5 12C5.5 12.8284 6.17157 13.5 7 13.5Z"/>
          <path d="M11 17.5C11.8284 17.5 12.5 16.8284 12.5 16C12.5 15.1716 11.8284 14.5 11 14.5C10.1716 14.5 9.5 15.1716 9.5 16C9.5 16.8284 10.1716 17.5 11 17.5Z"/>
          <path d="M16 11.5C16.8284 11.5 17.5 10.8284 17.5 10C17.5 9.17157 16.8284 8.5 16 8.5C15.1716 8.5 14.5 9.17157 14.5 10C14.5 10.8284 15.1716 11.5 16 11.5Z"/>
          <path d="M8.5 7C9.32843 7 10 6.32843 10 5.5C10 4.67157 9.32843 4 8.5 4C7.67157 4 7 4.67157 7 5.5C7 6.32843 7.67157 7 8.5 7Z"/>
        </svg>
      </button>
    `;
    document.body.appendChild(buttonContainer);

    document.getElementById('cookie-preferences-button')?.addEventListener('click', () => {
      this.showPreferencesModal();
    });
  }

  showPreferencesModal() {
    const preferences = this.getFromLocalStorage() || { necessary: true };
    const analyticsConsent = document.getElementById('analytics-consent');
    const marketingConsent = document.getElementById('marketing-consent');
    
    if (analyticsConsent && marketingConsent) {
      analyticsConsent.checked = preferences.analytics || false;
      marketingConsent.checked = preferences.marketing || false;
      document.getElementById('cookie-preferences-modal').style.display = 'block';
    }
  }
}

// Make sure CookieConsentManager is available globally
if (typeof window !== 'undefined') {
  window.CookieConsentManager = CookieConsentManager;
}

export default CookieConsentManager;