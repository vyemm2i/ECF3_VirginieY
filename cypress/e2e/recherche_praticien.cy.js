import Page_Recherche_Praticien from '../pages/page_recherche_praticien'

describe('Recherche de praticien', () => {

//   Scénario CAS PASSANT : Recherche par spécialité et ville

    it('Recherche par spécialité et ville', () => {

        // Accéder à la page de recherche
        Page_Recherche_Praticien.AccesPage()

        // Remplir les filtres
        Page_Recherche_Praticien.SelectionnerSpecialite('Médecin généraliste')
        Page_Recherche_Praticien.SaisirVille('Paris')

        // Cliquer sur "Rechercher"
        Page_Recherche_Praticien.CliquerRechercher()

        // Vérifier qu'au moins un praticien est affiché
        Page_Recherche_Praticien.ObtenirResultats()
        .should('have.length.at.least', 1)
        .each(carte => {
            Page_Recherche_Praticien.VerifierInfosCarte(carte)
        })

        // Vérifier le titre qui indique le nombre de praticiens trouvés
        cy.get('h1').should('contain.text', 'praticien')
    })



//   Scénario CAS NON-PASSANT : Recherche sans résultat

    it('Recherche sans résultat', () => {

        // Accéder à la page
        Page_Recherche_Praticien.AccesPage()

        // Remplir les filtres
        Page_Recherche_Praticien.SelectionnerSpecialite('Cardiologue')
        Page_Recherche_Praticien.SaisirVille('Village Inexistant')

        // Cliquer sur "Rechercher"
        Page_Recherche_Praticien.CliquerRechercher()

        // Vérifier le message "Aucun praticien trouvé"
        Page_Recherche_Praticien.ObtenirMessageAucunResultat()
            .should('be.visible')
            .and('contain.text', 'Aucun praticien trouvé')
    })


})
