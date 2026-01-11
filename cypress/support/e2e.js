// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// ================================
// SETUP & TEARDOWN GLOBAL CYPRESS
// ================================
// Nettoyage global afin de garantir l'indépendance des tests

// Creation variable dans cypress env
Cypress.env('globalCounter', 0)

// 1) AVANT chaque test :
//---------------------------------

beforeEach(() => {

    // Nettoyage de l'état du navigateur
    cy.clearCookies()
    cy.clearLocalStorage()
  
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
  
  })
  
// 2) APRÈS chaque test :
//---------------------------------

afterEach(() => {
  
    cy.clearCookies()
    cy.clearLocalStorage()
  
  })