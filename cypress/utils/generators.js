// ================================
// GENERATION DES DONNEES D'INSCRIPTION
// ================================

// Génère un prénom de test

export function GenPrenom(index) {
  return `prenom_test_${index}`
}

// Génère un nom de test

export function GenNom(index) {
  return `nom_test_${index}`
}


// Génère un email unique et lisible

export function GenEmailUnique(index) {
  let randomPart = Math.floor(Math.random() * 1000)
  return `email_test_${index}_${randomPart}@email.com`
}


// Génère un numéro de téléphone de test

export function GenTelephone(index) {
  return `06 00 00 00 ${index.toString().padStart(2, '0')}`
}


// Génère un mot de passe de test

export function GenMot_de_passe(index) {
  return `Mdp_test_${index}!`
}
