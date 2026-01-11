// ================================
// PAGE INSCRIPTION
// ================================

class Page_Inscription {

    AccesPage() {
      cy.visit('/register') 
    }

    SaisirPrenom(prenom) {
        cy.get('input[id="firstName"]').type(prenom)
    }
    
    SaisirNom(nom) {
        cy.get('input[id="lastName"]').type(nom)
    }

    SaisirEmail(email) {
      cy.get('input[id="email"]').type(email)
    }

    SaisirTelephone(telephone) {
        cy.get('input[id="phone"]').type(telephone)
    }

    SaisirMot_de_passe(mdp) {
      cy.get('input[id="password"]').type(mdp)
    }
  
    SaisirConfirmation_MDP(mdp) {
      cy.get('input[id="confirmPassword"]').type(mdp)
    }
  
    Cocher_ConditionsGenerales_PolitiqueConfidentialite() {
        cy.get('input[name="acceptTerms').click()
    }

    Click_CreationCompte() {
      cy.get('button[type="submit"]').click()
    }

}

// Crée une instance de la classe Page_Inscription.
// Cette instance contient toutes les méthodes (visit(), enterEmail(), etc.).
// Sans new, pas d'objet utilisable.

  export default new Page_Inscription()