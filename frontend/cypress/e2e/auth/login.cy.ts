describe('Authentication', () => {
  it('should navigate to login page', () => {
    cy.visit('/');
    cy.get('a[href*="login"]').click();
    cy.url().should('include', '/login');
  });
});
