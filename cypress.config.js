const { defineConfig } = require('cypress')

// require('cypress') : importe le module Cypress dans ce fichier.
// { defineConfig } : c’est une fonction fournie par Cypress pour définir la configuration de façon plus structurée.
// En gros, ça prépare Cypress à lire notre configuration avec une syntaxe officielle et moderne.

// module.exports : c’est la façon en Node.js d’exporter quelque chose pour qu’il soit utilisé ailleurs.
// on exporte notre configuration Cypress.
// defineConfig({...}) : prend un objet avec toutes les options de configuration (baseUrl, temps de timeout, reporter, etc.)

// e2e: { ... }
// Cette partie concerne les tests End-to-End (E2E).
// Tout ce qui est mis ici s’applique aux tests qui interagissent avec l'application entière (comme l’inscription, connexion, rendez-vous…).

// setupNodeEvents(on, config) { ... }
// C’est une fonction “callback” que Cypress appelle pour permettre de :
// écouter des événements du navigateur ou du test (on)
// modifier la configuration si besoin (config)

// Exemple : Générer des captures d’écran quand un test échoue, ou enregistrer des logs.

let globalCounter = 0

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // URL du frontend

    setupNodeEvents(on, config) {
      // implement node event listeners here
      // on peut ajouter des scripts si nécessaire

      on('task', {
        getNextIndex() {
          globalCounter++
          return globalCounter
        },


        // Au cas ou on aurait besoin de reset le compteur d'index
        resetCounter() {
          globalCounter = 0
          return null
        }
      })

      // IMPORTANT : toujours retourner config
      return config
    }
  }
}) 