const esbuild = require('esbuild');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Security configuration
const securityConfig = {
  // List of allowed external packages (now including 'dompurify')
  allowedExternals: [
    'react',
    'react-dom',
    'lodash',
    'papaparse',
    'dompurify'
  ],
  // List of allowed import paths (including the project root and relative paths)
  allowedPaths: [
    './',
    './src',
    './components',
    './utils',
    './core',
    '../utils',
    '../core',
    './translations'
  ],
  // Banned import patterns (removed localStorage and sessionStorage)
  bannedImports: [
    'eval',
    'Function',
    'document.write'
  ]
};

// Custom plugin to validate imports
const securityPlugin = {
  name: 'security-validator',
  setup(build) {
    // Validate imports
    build.onResolve({ filter: /.*/ }, args => {
      const isAllowedExternal = securityConfig.allowedExternals.includes(args.path);
      const isAllowedPath = securityConfig.allowedPaths.some(p => args.path.startsWith(p));
      if (!isAllowedExternal && !isAllowedPath) {
        throw new Error(`Import not allowed: ${args.path}`);
      }
    });
    // Check for banned patterns
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      const source = await fs.readFile(args.path, 'utf8');
      for (const pattern of securityConfig.bannedImports) {
        if (source.includes(pattern)) {
          throw new Error(`Banned pattern found in ${args.path}: ${pattern}`);
        }
      }
      return { contents: source };
    });
  }
};

// Custom plugin to add integrity hashes for JS
const integrityPlugin = {
  name: 'integrity-hash',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;
      try {
        const outputFile = 'dist/cookie-consent.min.js';
        const fileContent = await fs.readFile(outputFile);
        const hash = crypto.createHash('sha384').update(fileContent).digest('base64');
        await fs.writeFile(
          'dist/integrity.json',
          JSON.stringify({ hash: `sha384-${hash}` }, null, 2)
        );
        console.log(`Integrity hash generated for JS: sha384-${hash}`);
      } catch (error) {
        console.error('Failed to generate JS integrity hash:', error);
      }
    });
  }
};

// Build configuration
const buildConfig = {
  entryPoints: ['src/cookie-consent.js'],
  bundle: true,
  minify: true,
  sourcemap: 'external',
  format: 'iife',
  globalName: 'CookieConsentManager',
  target: ['es2015'],
  outfile: 'dist/cookie-consent.min.js',
  plugins: [securityPlugin, integrityPlugin],
  loader: { '.js': 'jsx' },
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'window'
  },
  metafile: true,
  logLevel: 'info',
  splitting: false,
  treeShaking: true,
  footer: {
    js: 'window.CookieConsentManager = CookieConsentManager.default || CookieConsentManager;'
  },
  banner: {
    js: '/* Cookie Consent Manager - Copyright (c) 2024 Herm.io. All rights reserved. */'
  },
  legalComments: 'none',
  drop: ['debugger', 'console']
};

// Function to validate the build output for JS
async function validateBuild(outputFile) {
  try {
    const content = await fs.readFile(outputFile, 'utf8');
    const dangerousPatterns = [
      'eval\\(',
      'Function\\(',
      'document\\.write'
    ];
    for (const pattern of dangerousPatterns) {
      if (new RegExp(pattern).test(content)) {
        throw new Error(`Dangerous pattern found in build: ${pattern}`);
      }
    }
    const stats = await fs.stat(outputFile);
    const maxSize = 500 * 1024; // 500KB
    if (stats.size > maxSize) {
      throw new Error(`Build size exceeds maximum allowed: ${stats.size} bytes`);
    }
    return true;
  } catch (error) {
    console.error('Build validation failed:', error);
    return false;
  }
}

// Main build function
async function build() {
  try {
    // Ensure dist directory exists
    await fs.mkdir('dist', { recursive: true });
    // Clear previous build
    await fs.rm('dist', { recursive: true, force: true });
    await fs.mkdir('dist', { recursive: true });
    // Run esbuild
    const result = await esbuild.build(buildConfig);
    // Validate JS output
    const isValid = await validateBuild('dist/cookie-consent.min.js');
    if (!isValid) {
      throw new Error('Build validation failed');
    }
    // Generate build report
    const metafile = result.metafile;
    await fs.writeFile('dist/build-report.json', JSON.stringify(metafile, null, 2));

    // --- NEW: Copy CSS file from src/styles to dist ---
    const cssSrc = path.join('src', 'styles', 'cookie-consent.css');
    const cssDest = path.join('dist', 'cookie-consent.css');
    await fs.copyFile(cssSrc, cssDest);
    console.log('Copied cookie-consent.css to dist');

    // Generate integrity hash for CSS
    const cssContent = await fs.readFile(cssDest);
    const cssHash = crypto.createHash('sha384').update(cssContent).digest('base64');
    await fs.writeFile(
      path.join('dist', 'integrity.css.json'),
      JSON.stringify({ hash: `sha384-${cssHash}` }, null, 2)
    );
    console.log(`Integrity hash for CSS generated: sha384-${cssHash}`);

    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();