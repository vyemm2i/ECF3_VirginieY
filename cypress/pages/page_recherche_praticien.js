// ================================
// PAGE RECHERCHE PRATICIEN
// ================================

class Page_Recherche_Praticien {

    AccesPage() {
        cy.visit('/') // URL de la page de recherche
    }

    SelectionnerSpecialite(specialite) {
        cy.get('input[id="search-specialty"]').type(specialite)
    }

    SaisirVille(ville) {
        cy.get('input[id="search-city"]').type(ville)
    }

    CliquerRechercher() {
        cy.get('button[type="submit"]').click()
    }

    // Méthode pour récupérer le message lorsqu'aucun praticien n'est trouvé
    ObtenirMessageAucunResultat() {
        return cy.get('div.no-results p:first') // premier <p> à l'intérieur
    }

    // Méthode pour récupérer tous les résultats
    ObtenirResultats() {
        return cy.get('ul.practitioners-list li a.practitioner-card')
        // ici : on cible tous les <a> avec classe practitioner-card à l'intérieur de <li> de la liste
    }

    VerifierInfosCarte(carte) {
        const carteCypress = cy.wrap(carte) // transforme le jQuery element en élément Cypress
        carteCypress.find('div.practitioner-info').within(() => {
            cy.get('h2.practitioner-name').should('exist')
            cy.get('p.practitioner-specialty').should('exist')
            cy.get('p.practitioner-address').should('exist')
        })
    }

}

// Crée une instance pour l’utiliser directement
export default new Page_Recherche_Praticien()
