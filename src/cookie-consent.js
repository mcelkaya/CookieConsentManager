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
              class="fixed bottom-4 right-4 p-3 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 z-[9998]"
              aria-label="Cookie Preferences">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.598 11.064a1.006 1.006 0 0 0-.854-.172A2.938 2.938 0 0 1 20 11c-1.654 0-3-1.346-3-3 0-.217.031-.444.099-.672.008-.021.013-.043.021-.064a.997.997 0 0 0-.234-.945 1.002 1.002 0 0 0-.92-.292C15.3 6.157 14.62 6.5 13.89 6.5c-1.654 0-3-1.346-3-3 0-.217.031-.444.099-.672.008-.021.013-.043.021-.064a.997.997 0 0 0-.234-.945 1.002 1.002 0 0 0-.92-.292C8.85 1.898 8.829 2 8.808 2c-1.654 0-3 1.346-3 3 0 .217-.031.444-.099.672a3.001 3.001 0 0 1-3.829 2.114A1.002 1.002 0 0 0 .968 8.63c.656 3.464 2.63 6.492 5.469 8.335 2.84 1.842 6.223 2.382 9.463 1.524.174-.045.348-.097.5-.168.149-.069.295-.14.442-.217.14-.072.281-.149.419-.229.139-.081.277-.164.411-.253.135-.088.269-.18.399-.276.131-.096.26-.194.387-.297.126-.102.25-.208.374-.315.121-.108.242-.217.359-.331.118-.115.235-.234.349-.355.114-.12.227-.243.335-.369.109-.126.216-.254.32-.385.102-.13.201-.262.297-.395.097-.134.192-.269.284-.406.092-.137.182-.277.269-.418.086-.141.17-.284.251-.428.081-.145.16-.292.235-.441.075-.147.147-.297.217-.447.069-.151.136-.304.199-.458.062-.154.122-.31.179-.467.057-.157.111-.316.163-.477.052-.161.101-.323.147-.486.045-.163.088-.327.128-.492.04-.167.077-.334.111-.503.034-.166.065-.334.093-.501.028-.169.053-.339.075-.509.023-.17.043-.341.06-.512.017-.172.03-.345.042-.518.012-.173.022-.345.028-.518.007-.173.011-.346.011-.52 0-.172-.004-.345-.011-.517a18.75 18.75 0 0 0-.028-.518c-.012-.172-.025-.345-.042-.517-.017-.171-.037-.342-.06-.512-.022-.17-.047-.339-.075-.508-.028-.167-.059-.334-.093-.501-.034-.166-.071-.334-.111-.503-.04-.165-.083-.329-.128-.492-.046-.162-.095-.324-.147-.485-.052-.161-.106-.32-.163-.476-.057-.157-.117-.313-.179-.468-.063-.153-.13-.306-.199-.458-.07-.15-.142-.3-.217-.447-.075-.147-.154-.289-.235-.441-.081-.144-.165-.287-.251-.428-.087-.141-.177-.281-.269-.418-.092-.137-.187-.272-.284-.406-.096-.133-.195-.265-.297-.395-.104-.131-.211-.259-.32-.385-.108-.126-.221-.249-.335-.369-.114-.121-.231-.24-.349-.355-.117-.114-.238-.223-.359-.331-.124-.107-.248-.213-.374-.315-.127-.103-.256-.201-.387-.297-.13-.096-.264-.188-.399-.276-.134-.089-.272-.172-.411-.253-.138-.08-.279-.157-.419-.229-.147-.077-.293-.148-.442-.217-.152-.071-.326-.123-.5-.168-.286-.077-.576-.138-.87-.188C9.828 7.898 9 6.467 9 5a3 3 0 0 1 3-3c.217 0 .444.031.672.099a3.001 3.001 0 0 0 3.829-2.114A1.002 1.002 0 0 1 17.517.042c3.465.656 6.493 2.63 8.336 5.469 1.842 2.84 2.382 6.223 1.524 9.463-.045.174-.097.348-.168.5-.069.149-.14.295-.217.442-.072.14-.149.281-.229.419-.081.139-.164.276-.253.411-.088.135-.18.269-.276.399-.096.131-.194.26-.297.387-.102.126-.208.25-.315.374-.108.121-.217.242-.331.359-.115.118-.234.235-.355.349-.12.114-.243.227-.369.335-.126.109-.254.216-.385.32-.13.102-.262.201-.395.297-.134.097-.269.192-.406.284-.137.092-.277.182-.418.269-.141.086-.284.17-.428.251-.145.081-.292.16-.441.235-.147.075-.297.147-.447.217-.151.069-.304.136-.458.199-.154.062-.31.122-.467.179-.157.057-.316.111-.477.163-.161.052-.323.101-.486.147-.163.045-.327.088-.492.128-.167.04-.334.077-.503.111-.166.034-.334.065-.501.093-.169.028-.339.053-.509.075-.17.023-.341.043-.512.06-.172.017-.345.03-.518.042-.173.012-.345.022-.518.028-.173.007-.346.011-.52.011-.172 0-.345-.004-.517-.011Z"/>
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