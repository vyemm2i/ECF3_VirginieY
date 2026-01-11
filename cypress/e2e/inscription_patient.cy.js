import Page_Inscription from '../pages/page_inscription_patient'
import { GenPrenom, GenNom, GenEmailUnique, GenTelephone, GenMot_de_passe, getNextIndex } from '../utils/generators'


// ================================
// PREMIERE FEATURE
// ================================

describe('Inscription patient', () => {


//     Scénario CAS PASSANT : Inscription réussie

  it("Doit permettre à un nouvel utilisateur de s'inscrire", () => {

    // Génère un index pour cet utilisateur
    let index = 0

    cy.task('getNextIndex').then(globalCounter => {

      index = globalCounter
      cy.log('Nouvelle valeur : ' + index);

      let prenom = GenPrenom(index)
      let nom = GenNom(index)
      let email = GenEmailUnique(index)
      let telephone = GenTelephone(index)
      let mdp = GenMot_de_passe(index)

      cy.log(`Données générées : ${prenom}, ${nom}, ${email}, ${telephone}, ${mdp}`)

      Page_Inscription.AccesPage() // adresse de ton frontend

      Page_Inscription.SaisirPrenom(prenom)
      Page_Inscription.SaisirNom(nom)
      Page_Inscription.SaisirEmail(email)
      Page_Inscription.SaisirTelephone(telephone)
      Page_Inscription.SaisirMot_de_passe(mdp)
      Page_Inscription.SaisirConfirmation_MDP(mdp)
      Page_Inscription.Cocher_ConditionsGenerales_PolitiqueConfidentialite()
  
      // Intercepte la requête API
      cy.intercept('POST', '/api/auth/register').as('register')
      Page_Inscription.Click_CreationCompte()

      cy.wait('@register').then((interception) => {
        cy.log(`Status API : ${interception.response.statusCode}`)
        cy.log(`Réponse API : ${JSON.stringify(interception.response.body)}`)
      })

      // Vérif qu’on est redirigé vers la page d’accueil
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.get('h1[id="hero-title"]').contains('Prenez rendez-vous avec un professionnel de santé').should('be.visible')


    });
  })

//   Scénario CAS NON-PASSANT : Inscription échouée - Email déjà utilisé

  it("Doit afficher une erreur si l'email est déjà utilisé", () => {

    const prenom = 'Jean'
    const nom = 'Dupont'
    const email = 'jean.dupont@email.com' // email déjà existant
    const telephone = '06 11 11 11 11'
    const mdp = 'Password123!'
  
    cy.log('Test inscription avec un email déjà existant')
  
    Page_Inscription.AccesPage()
  
    // Vérifie qu'on est bien sur la page d'inscription
    cy.url().should('include', '/register')
  
    Page_Inscription.SaisirPrenom(prenom)
    Page_Inscription.SaisirNom(nom)
    Page_Inscription.SaisirEmail(email)
    Page_Inscription.SaisirTelephone(telephone)
    Page_Inscription.SaisirMot_de_passe(mdp)
    Page_Inscription.SaisirConfirmation_MDP(mdp)
    Page_Inscription.Cocher_ConditionsGenerales_PolitiqueConfidentialite()
  
    // Interception API
    cy.intercept('POST', '/api/auth/register').as('register')
  
    Page_Inscription.Click_CreationCompte()
  
    // Vérifie la réponse backend
    cy.wait('@register').its('response.statusCode').should('eq', 400)
  
    // Vérifie le message d'erreur affiché à l'écran
    cy.contains('Un compte existe déjà avec cet email').should('be.visible')

  })


})
