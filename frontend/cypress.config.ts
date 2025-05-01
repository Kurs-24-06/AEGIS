// frontend/cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,
    experimentalStudio: true,
    testIsolation: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      apiUrl: 'http://localhost:8080/api',
      coverage: true,
    },
    setupNodeEvents(on, config) {
      // Implementiere Code-Coverage für die Frontend-App
      const codeCoverageTask = require('@cypress/code-coverage/task');
      codeCoverageTask(on, config);

      // Konfiguriere Umgebungsvariablen basierend auf ENV
      const environment = process.env.TEST_ENV || 'dev';
      console.log(`Running Cypress in ${environment} environment`);

      // Umgebungsspezifische Konfiguration
      if (environment === 'staging') {
        config.baseUrl = 'https://staging.aegis-security.com';
        config.env.apiUrl = 'https://api-staging.aegis-security.com/api';
      } else if (environment === 'production') {
        config.baseUrl = 'https://aegis-security.com';
        config.env.apiUrl = 'https://api.aegis-security.com/api';
      }

      return config;
    },
  },
});
