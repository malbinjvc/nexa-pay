/// <reference types="cypress" />

Cypress.on('uncaught:exception', () => {
  // Prevent Cypress from failing on uncaught exceptions from the app
  return false;
});

export {};
