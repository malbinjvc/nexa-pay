describe('Authentication', () => {
  it('should display the landing page', () => {
    cy.visit('/');
    cy.contains('AI-Powered Invoicing').should('be.visible');
    cy.contains('Start Free').should('be.visible');
    cy.contains('View Pricing').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.visit('/');
    cy.contains('Sign In').click();
    cy.url().should('include', '/login');
    cy.contains('Sign in to manage your invoices').should('be.visible');
  });

  it('should display magic link and OAuth options', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('be.visible');
    cy.contains('Send Magic Link').should('be.visible');
    cy.contains('Google').should('be.visible');
    cy.contains('GitHub').should('be.visible');
  });

  it('should validate email input for magic link', () => {
    cy.visit('/login');
    // Verify login form elements are present and interactive
    cy.contains('Send Magic Link').should('be.visible');
    cy.get('input[type="email"]').should('be.visible').type('invalid-email');
    cy.contains('Send Magic Link').click();
    // HTML5 validation prevents submission
    cy.get('input[type="email"]:invalid').should('exist');
  });

  it('should not show dashboard stats without authentication', () => {
    cy.visit('/dashboard');
    // Dashboard page renders but without auth, API calls fail
    // so actual stats are never displayed
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Total Revenue').should('not.exist');
  });

  it('should display the pricing page', () => {
    cy.visit('/pricing');
    cy.contains('Simple, Transparent Pricing').should('be.visible');
    cy.contains('Free').should('be.visible');
    cy.contains('Pro').should('be.visible');
    cy.contains('Enterprise').should('be.visible');
  });
});
