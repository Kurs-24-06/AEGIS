import { defineConfig } from 'cypress';
// Import as ES module instead of require
import webpackPreprocessor from '@cypress/webpack-preprocessor';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/node_modules/**', '**/cypress/fixtures/**'],
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/node_modules/**', '**/cypress/fixtures/**'],
    setupNodeEvents(on, config) {
      on('file:preprocessor', webpackPreprocessor());
      return config;
    },
  },
});
