const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/cookie-consent.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'CookieConsentManager',
  outfile: 'dist/cookie-consent.min.js',
}).catch(() => process.exit(1));