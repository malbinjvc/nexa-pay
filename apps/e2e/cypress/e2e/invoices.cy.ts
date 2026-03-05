describe('Invoice Management', () => {
  beforeEach(() => {
    // These tests verify page structure without authentication
    // Full E2E tests would require Supabase test credentials
  });

  it('should display the pricing plans with correct features', () => {
    cy.visit('/pricing');

    // Free plan
    cy.contains('Up to 5 clients').should('be.visible');
    cy.contains('10 invoices per month').should('be.visible');

    // Pro plan
    cy.contains('Up to 50 clients').should('be.visible');
    cy.contains('AI financial insights').should('be.visible');

    // Enterprise plan
    cy.contains('Unlimited clients').should('be.visible');
    cy.contains('Custom integrations').should('be.visible');
  });

  it('should have proper pricing amounts', () => {
    cy.visit('/pricing');
    cy.contains('$0').should('be.visible');
    cy.contains('$19').should('be.visible');
    cy.contains('$49').should('be.visible');
  });

  it('should have CTA buttons on pricing page', () => {
    cy.visit('/pricing');
    cy.contains('Get Started').should('be.visible');
    cy.contains('Upgrade to Pro').should('be.visible');
    cy.contains('Upgrade to Enterprise').should('be.visible');
  });

  it('should navigate from landing to pricing', () => {
    cy.visit('/');
    cy.contains('View Pricing').click();
    cy.url().should('include', '/pricing');
  });

  it('should have working navigation links on landing page', () => {
    cy.visit('/');
    cy.contains('Get Started for Free').should('be.visible');
    cy.contains('Professional Invoices').should('be.visible');
    cy.contains('Stripe Payments').should('be.visible');
    cy.contains('AI Insights').should('be.visible');
  });
});
