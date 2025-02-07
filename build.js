const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/cookie-consent.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'CookieConsentManager',
  target: ['es2015'],
  outfile: 'dist/cookie-consent.min.js',
  footer: {
    js: 'window.CookieConsentManager = CookieConsentManager.default || CookieConsentManager;'
  }
}).catch(() => process.exit(1));