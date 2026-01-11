# MediBook - Application de Prise de Rendez-vous Médicaux

Application web complète pour la prise de rendez-vous médicaux en ligne, développée dans le cadre de l'ECF "Automatisation des Tests Logiciels".

## 📋 Description

MediBook permet aux patients de :
- Rechercher des praticiens par spécialité et localisation
- Consulter les disponibilités en temps réel
- Prendre rendez-vous en ligne 24h/24
- Gérer leurs rendez-vous (consultation, annulation)
- Recevoir des confirmations par email

# Instructions pour exécuter les tests

## Description

Ce projet contient des tests automatisés Cypress pour l'application de prise de rendez-vous avec des praticiens.  
Les tests couvrent plusieurs scénarios, notamment :

- Inscription d’un patient
- Recherche de praticien
- Recherche sans résultat
- Prise de rendez-vous

Le projet utilise le **Page Object Model (POM)** pour organiser les pages et interactions.


## 🏗️ Architecture

```
medibook/
├── frontend/          # Application React
├── backend/           # API Node.js/Express
├── database/          # Scripts SQL
├── cypress/
   │
   ├─ e2e/
   │   ├─ inscription_patient.cy.js
   │   ├─ recherche_praticien.cy.js
   │
   ├─ pages/
   │   ├─ page_recherche_praticien.js
   │   ├─ page_inscription_patient.js
   │
   ├─ support/
   │   └─ e2e.js
   └─ fixtures/
└── docker-compose.yml # Orchestration Docker

```

## 🚀 Installation et Démarrage

### Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour le développement local)

### Démarrage rapide

```bash
# Cloner le projet
git clone <repository-url>
cd medibook

# Installer les dépendances
npm install

# Installer Cypress
npx cypress install

# Lancer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

# Exécuter les tests

Les tests ont été exécuté en local.

### Mode interactif : Depuis l’interface graphique
```bash
npx cypress open
```

### Mode headless : Tous les tests automatiquement dans le terminal
```bash
npx cypress run
```

### Exécuter un test en particulier
```bash
npx cypress run --spec "cypress/e2e/nom_fichier.cy.js"
```

# C. Gestion de version

Décrivez :
- La structure du repository Git pour les tests
- La stratégie de branching
- La procédure de rollback en cas de problème

### 1. Structure du repository Git pour les tests

Le repository est organisé pour que les tests soient faciles à comprendre et à maintenir.
Les tests automatisés sont regroupés dans le dossier cypress/e2e.
Les pages utilisant le Page Object Model sont placées dans cypress/pages, ce qui permet de réutiliser les actions et de limiter les duplications de code.
Les fonctions utilitaires, comme la génération de données de test, sont stockées dans cypress/utils.
Les fichiers de configuration (Cypress et CI/CD) se trouvent à la racine du projet.

Cette organisation rend le projet plus lisible, plus structuré et plus simple à faire évoluer.

### 2. Stratégie de branching

Le projet utilise une branche principale main, qui contient une version stable et validée des tests.
Chaque nouvelle fonctionnalité ou évolution des tests sera développée dans une branche dédiée (par exemple feature/inscription_patient).
Une fois le développement terminé, une Pull Request est créée afin de relire le code et de lancer automatiquement les tests via la CI/CD.
La branche est fusionnée dans main uniquement si les tests sont validés, ce qui permet d’éviter les régressions.

### 3. Procédure de rollback en cas de problème

Si un problème est détecté après une mise à jour des tests, il est possible de revenir rapidement à une version stable grâce à Git.
Le rollback consiste à restaurer un commit ou un tag précédemment validé sur la branche main.
Cette opération peut être réalisée via un git revert ou en revenant à un tag stable.
Une fois le rollback effectué, les tests automatisés sont relancés pour s’assurer que le projet fonctionne correctement.

Cette procédure permet de corriger rapidement les erreurs et de garantir la stabilité du projet.

# A. Gestion des données de test : Stratégie

Les tests automatisés se font seulement sur des environnements de test (local, test, CI) et pas sur la production.

Chaque environnement a ses propres données, pour éviter de mélanger ou d’écraser les informations existantes.
Les données de test sont créées automatiquement pendant l’exécution pour que les tests soient indépendants et reproductibles partout.
Un mécanisme de préparation et nettoyage (setup/teardown) assure que l’environnement est toujours propre avant et après chaque test. En local, on peut par exemple réinitialiser la base en supprimant les volumes Docker.
Les paramètres spécifiques à chaque environnement (URL, API…) sont gérés avec des variables d’environnement, ce qui permet d’utiliser les mêmes tests partout sans changer le code.



### Accès aux services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Application React |
| API | http://localhost:4000 | Backend Node.js |
| Swagger | http://localhost:4000/api-docs | Documentation API |
| Mailhog | http://localhost:8025 | Interface emails |
| PostgreSQL | localhost:5432 | Base de données |

## 👥 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Patient | jean.dupont@email.com | Patient123! |
| Praticien | dr.martin@medibook.fr | Praticien123! |
| Admin | admin@medibook.fr | Admin123! |

## 🔧 Configuration

### Variables d'environnement Backend

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://medibook:medibook123@db:5432/medibook
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
SMTP_HOST=mailhog
SMTP_PORT=1025
FRONTEND_URL=http://localhost:3000
```

### Variables d'environnement Frontend

```env
REACT_APP_API_URL=http://localhost:4000/api
```

## 📚 API Documentation

La documentation Swagger est disponible sur `/api-docs`.

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

#### Praticiens
- `GET /api/practitioners` - Recherche de praticiens
- `GET /api/practitioners/:id` - Détails d'un praticien
- `GET /api/practitioners/:id/slots` - Créneaux disponibles

#### Rendez-vous
- `GET /api/appointments` - Liste des RDV
- `POST /api/appointments` - Créer un RDV
- `PUT /api/appointments/:id/cancel` - Annuler un RDV

#### Spécialités
- `GET /api/specialties` - Liste des spécialités

## 🧪 Tests

### Scénarios de test à automatiser

1. **Inscription Patient**
   - Créer un compte avec des données valides
   - Vérifier l'envoi de l'email de confirmation

2. **Connexion**
   - Se connecter avec des identifiants valides
   - Redirection vers le dashboard

3. **Recherche Praticien**
   - Rechercher par spécialité et ville
   - Vérifier les résultats affichés

4. **Prise de Rendez-vous**
   - Sélectionner un praticien
   - Choisir une date et un créneau
   - Confirmer la réservation

5. **Accessibilité**
   - Navigation au clavier
   - Compatibilité lecteur d'écran
   - Conformité WCAG 2.1 AA

## 🔐 Sécurité

- Authentification JWT
- Hashage des mots de passe (bcrypt)
- Validation des entrées
- Protection CSRF
- Headers de sécurité (Helmet)

## 📱 Responsive Design

L'application est responsive et s'adapte aux différentes tailles d'écran :
- Mobile (< 640px)
- Tablette (640px - 1024px)
- Desktop (> 1024px)

## ♿ Accessibilité

- Labels ARIA appropriés
- Navigation au clavier
- Contrastes suffisants
- Messages d'erreur explicites
- Skip links

## 🌱 Éco-conception

- Optimisation des requêtes
- Lazy loading des images
- Minimisation des ressources
- Cache côté client

## 📝 License

Ce projet est développé dans un cadre éducatif (ECF).

---

**HealthTech Solutions** - © 2024
