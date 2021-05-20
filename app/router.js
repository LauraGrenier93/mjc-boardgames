// Un routeur, sur lequel on branche des routes et des MW qui leur correspondent
const {
  Router
} = require('express');
//je crée mon router
const router = Router();
// j'importe les controllers
const mainController = require('./controllers/mainController');
const articleController = require('./controllers/articleController');
const gameController = require('./controllers/gameController');
const userController = require('./controllers/userController');
const eventController = require('./controllers/eventController');
const participantController = require('./controllers/participantController');
// implémentation de joi, avec un validator déja écrit dans le dossier "services" et un example de schéma dans le dossier "schema".
const {
  validateQuery,
  validateBody,
  validateParams
} = require('./services/validator');
const userLoginSchema = require('./schemas/userLoginSchema');
const userSigninSchema = require('./schemas/userSigninSchema');
const articleSchema = require('./schemas/articleSchema');
const gameSchema = require('./schemas/gameSchema');
const eventSchema = require('./schemas/eventSchema');
const resendEmailLinkSchema = require('./schemas/resendEmailLinkSchema');
const participantSchema = require('./schemas/participantSchema');
// Pour la mise en place d'une route sécurisé via la vérification d'un token : 
// express-jwt et express-jwt-blacklist pour blacklister des tokens.
var guard = require('express-jwt-permissions')();
const expressjwt = require('express-jwt');
const blacklist = require('express-jwt-blacklist');
//la config de express-jwt-blacklist :
// le jti est le JWT ID, l'identifiant unique du token, construit 
//dans la méthode handleLoginForm du userController via le pseudo de l'utilisateur et un nombre random a 6 chiffres.
blacklist.configure({
  tokenId: 'jti'
});
// (\d+) => sécurise le params et obligation de mettre un entier via une feature d'express, joi overkill ici, pour plus de controle,
// on passe une expression réguliére \d = [0-9] et + pour plusieurs chiffre mais pas zéro. Double antislash (\\) 
//car un seul a déja une fonction (sert a "échapper")
//Config de test pour POSTMAN : Header => 2 keys-value // Content-Type = application/x-www-form-urlencoded et Authorization = Bearer <TOKEN>
//Dans le body, on doit cocher : x-www-form-urlencoded
//Pour le Token, il faut faire une requete POST sur /connexion avec un user en BDD. La requete renvoie un Token. 
//on le copie et on le colle a la place de <TOKEN> dans la colonne value. Laisser un espace entre Bearer (nom issue d'une norme W3C) et le token.
//! DROITS D'ACCES :
//!-----------------------------------------------------------------------------------------
//! les routes situées sous le "router.use" (ligne 229) sont des routes protégées, qui nécésite l'envoi d'un token dans le header. Il suffit de placer les routes que l'on souhaite ouverte à tous au dessus de ce MW.
//! A ajouter aprés le slug pour changer les droits d'accés :

//! Pour autoriser une route aux seuls utilisateurs connéctés :
// expressjwt({secret: process.env.JWT_SECRET, algorithms: ['HS256'],isRevoked: blacklist.isRevoked}),
// ou on déplace la route au dessous du MW router.use ligne 229
//! pour autoriser une route aux seuls administrateurs :
// expressjwt({secret: process.env.JWT_SECRET, algorithms: ['HS256'],isRevoked: blacklist.isRevoked}), guard.check('Administrateur')
//! pour autoriser une route aux seuls modérateurs :
// expressjwt({secret: process.env.JWT_SECRET, algorithms: ['HS256'],isRevoked: blacklist.isRevoked}), guard.check('Modérateur')
//! pour autoriser une route aux modérateurs ET au administrateurs :
//expressjwt({secret: process.env.JWT_SECRET, algorithms: ['HS256'],isRevoked: blacklist.isRevoked}), guard.check([['Modérateur'],['Administrateur']]),
//! si l'on souhaite bloquer un groupe de routes :
/* const checkForPermissions = guard
  .check(['admin'])
  .unless({ path: '/not-secret' })
app.use(checkForPermissions) */
//! Ou ci-dessus, le chemin path, correspond a nos routes qui nécéssiteront le role admin !
//!---------------------------------------------------------------------------------------------------
// SQL pour changer de role = UPDATE "user" SET group_id = 3 WHERE first_name = 'Daisy_D'; // valeur de group_id => [1 = Membre, 2 = Administrateur, 3 = Modérateur]
/**
 * Page d'acceuil du site des Gardiens de la légende
 * @route GET /v1/
 * @group acceuil
 * @returns {JSON} 200 - la page d'acceuil
 */
router.get('/', mainController.init);
/**
 * Une connexion
 * @typedef {object} connexion
 * @property {string} pseudo - pseudo
 * @property {string} password - password
 */
/**
 * Autorise la connexion d'un utilisateur au site.
 * Route sécurisée avec Joi
 * @route POST /v1/connexion
 * @group connexion - Pour se connecter
 * @summary Supprimme un utilisateur en base de donnée
 * @param {connexion.Model} connexion.body.required - les informations qu'on doit fournir
 * @returns {JSON} 200 - Un utilisateur à bien été connecté
 */
router.post('/connexion', validateBody(userLoginSchema), userController.handleLoginForm);
/**
 * Une inscription
 * @typedef {object} inscription
 * @property {string} firstName - prénom
 * @property {string} lastName - nom de famille
 * @property {string} pseudo - pseudo
 * @property {string} emailAddress - email
 * @property {string} password - password
 * @property {string} passwordConfirm - la confirmation du password
 */
/**
 * Autorise l'inscription' d'un utilisateur au site.
 * Route sécurisée avec Joi
 * @route POST /v1/inscription
 * @group inscription - Pour s'inscire
 * @summary Inscrit un utilisateur en base de donnée
 * @param {inscription.Model} inscription.body.required - les informations d'inscriptions qu'on doit fournir
 * @returns {JSON} 200 - les données d'un utilisateur ont été inséré en BDD, redirigé vers la page de connexon
 */
router.post('/inscription', validateBody(userSigninSchema), userController.handleSignupForm);

/**
 * Un article
 * @typedef {object} articles
 * @property {number} id - id de l'article
 * @property {string} title - titre
 * @property {string} description - description du jeu
 * @property {string} createdDate - date de création
 * @property {string} updateDate - date de mise a jour
 * @property {number} authorId - référence a la table user
 * @property {number} tagId - référence a la catégorie de l'article
 */
/**
 * Affiche tous les articles.
 * @route GET /v1/articles
 * @group articles - gestion des articles
 * @summary Affiche tous les articles en base de donnée
 * @param {articles.Model} articles.body.required
 * @returns {JSON} 200 - Tous les articles
 */
router.get('/articles', articleController.allArticles);
/**
 * Affiche un article.
 * @route GET /v1/articles/:id
 * @group articles - gestion des articles
 * @summary Affiche un article en base de donnée
 * @param {articles.Model} articles.body.required
 * @param {number} id.path.required - l'id à fournir
 * @returns {JSON} 200 - Un article a été délivré
 */
router.get('/articles/:id(\\d+)', articleController.oneArticle);
/**
 * Un jeux
 * @typedef {object} jeux
 * @property {number} id - id de l'événement
 * @property {string} title - titre
 * @property {number} minPlayer - nombre minimum de joueur
 * @property {number} maxPlayer - nombre minimum de joueur
 * @property {number} minAge - age minimum requis
 * @property {number} duration - durée moyenne de jeu
 * @property {number} quantity - nombre d'exemplaire du jeu
 * @property {string} purchasedDate - date de l'achat du jeu
 * @property {string} creator - nom du créateur du jeux
 * @property {string} editor - éditeur du jeu
 * @property {string} description - description du jeu
 * @property {string} year - année de sortie du jeu
 * @property {number} typeId - référence au type de jeu
 */
/**
 * Affiche tous les jeux.
 * @route GET /v1/jeux
 * @group jeux - gestion des jeux
 * @summary Affiche tous les jeux en base de donnée
 * @param {jeux.Model} jeux.body.required
 * @returns {JSON} 200 - Tous les jeux ont été délivré
 */
router.get('/jeux', gameController.allGames);
/**
 * Affiche un jeux.
 * @route GET /v1/jeux/:id
 * @group jeux - gestion des jeux
 * @summary Affiche un jeux en base de donnée
 * @param {number} id.path.required - l'id à fournir
 * @param {jeux.Model} jeux.body.required
 * @returns {JSON} 200 - Un jeux a été délivré
 */
router.get('/jeux/:id(\\d+)', gameController.oneGame);
/**
 * Un évenement
 * @typedef {object} evenement
 * @property {number} id - id de l'événement
 * @property {string} title - titre
 * @property {string} description - description
 * @property {string} eventDate - date de l'évenement
 * @property {string} createdDate - date de création
 * @property {string} updateDate - date de mise a jour
 * @property {number} creatorId - référence au nom de l'auteur de l'événement
 * @property {number} tagId - référence a la categorie de l'événement
 */
/**
 * Affiche tous les évenements.
 * @route GET /v1/evenements
 * @group evenement - gestion des évenements
 * @summary Affiche tous les évenements en base de donnée
 * @param {evenement.Model} evenement.body.required
 * @returns {JSON} 200 - Tous les évenements ont été délivré
 */
router.get('/evenements', eventController.allEvent);
/**
 * Affiche un évenement.
 * @route GET /v1/evenements/:id
 * @group evenement - gestion des évenements
 * @summary Affiche un évenements en base de donnée
 * @param {evenement.Model} evenement.body.required
 * @param {number} id.path.required - l'id à fournir
 * @returns {JSON} 200 - Un évenement a été délivré
 */
router.get('/evenements/:id(\\d+)', eventController.oneEvent);
// route de vérification de l'email lors de l'inscription
// Reçois userId et Token en query, vérifis ce qu'il faut et change le statut en BDD de verifyemail dans la table user.
router.get('/verifyEmail', validateQuery(resendEmailLinkSchema), userController.verifyEmail);
//! Toutes les routes en dessous de ce MW nécéssiteront une autorisation, 
//! c'est a dire la présence d'un token non révoqué dans leur headers. 
//! Les routes que l'on veut accessible également aux non inscrits, devront donc être placé au dessus.
/**
 * Une méthode permettant la déconnexion en passant en ne reconnaissant plus le token come valide.
 * Ici, safety first ! Même si le token en front, est dérobé du Local storage, via une attaque XSS, 
 * l'attaquant ne pourra pas s'en reservir, l'API l'a invalidé lors de la déconnexion !
 * Renvoie un message en jsons confirmant la décconexion.
 * @method logout
 */
router.use(expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  isRevoked: blacklist.isRevoked,
}));
// Syntaxe si l'on souhaite bloquer route par route => a coller aprés la route :
//expressjwt({secret: process.env.JWT_SECRET, algorithms: ['HS256'],isRevoked: blacklist.isRevoked})
//!------------------------------------------------------------------------------------------------------
/**
 * Permet de mettre à jour un article.
 * @route PATCH /v1/articles/:id
 * @group articles - gestion des articles
 * @summary Mets à jour un article en base de donnée
 * @param {articles.model} articles.body.required
 * @returns {JSON} 200 - Un article a été créé
 */
router.patch('/articles/:id(\\d+)', validateBody(articleSchema, 'PATCH'), articleController.updateArticle);
/**
 * Permet de créer un nouvel article.
 * @route POST /v1/articles
 * @group articles - gestion des articles
 * @summary Insére un article en base de donnée
 * @param {articles.model} articles.body.required
 * @returns {JSON} 200 - Un article a été créé
 */
router.post('/articles', validateBody(articleSchema, 'POST'), articleController.newArticle);
/**
 * Permet de supprimer un article.
 * @route DELETE /v1/articles/:id
 * @group articles - gestion des articles
 * @summary Supprime un article en base de donnée
 * @param {articles.model} articles.body.required
 * @param {number} id.path.required - l'id à fournir
 * @returns {JSON} 200 - Un article a été supprimé
 */
router.delete('/articles/:id(\\d+)', articleController.deleteArticle);
/**
 * Un jeux
 * @typedef {object} jeux
 * @property {number} id - id de l'événement
 * @property {string} title - titre
 * @property {number} minPlayer - nombre minimum de joueur
 * @property {number} maxPlayer - nombre minimum de joueur
 * @property {number} minAge - age minimum requis
 * @property {number} duration - durée moyenne de jeu
 * @property {number} quantity - nombre d'exemplaire du jeu
 * @property {string} purchasedDate - date de l'achat du jeu
 * @property {string} creator - nom du créateur du jeux
 * @property {string} editor - éditeur du jeu
 * @property {string} description - description du jeu
 * @property {string} year - année de sortie du jeu
 * @property {number} typeId - référence au type de jeu
 */
/**
 * Permet de créer un nouveau jeu
 * @route POST /v1/jeux
 * @group jeux - gestion des jeux
 * @summary Insére un jeu en base de donnée
 * @param {jeux.model} jeux.body.required
 * @returns {JSON} 200 - Un jeu a été créé
 */
router.post('/jeux', validateBody(gameSchema, 'POST'), gameController.newGame);
/**
 * Permet de mettre à jour un jeu
 * @route PATCH /v1/jeux/:id
 * @group jeux - gestion des jeux
 * @summary Mets à jour un jeu en base de donnée
 * @param {jeux.model} jeux.body.required
 * @param {number} id.path.required - l'id à fournir
 * @returns {JSON} 200 - Un jeu a été mis à jour
 */
router.patch('/jeux/:id(\\d+)', validateBody(gameSchema, 'PATCH'), gameController.updateGame);
/**
 * Permet de supprimer un jeu
 * @route DELETE /v1/jeux/:id
 * @group jeux - gestion des jeux
 * @summary Supprimé un jeu en base de donnée
 * @param {jeux.model} jeux.body.required
 * @param {number} id.path.required - l'id à fournir
 * @returns {JSON} 200 - Un jeu a été supprimé
 */
router.delete('/jeux/:id(\\d+)', gameController.deleteGame);
/**
 * Permet de créer un nouvel évènement.
 * @route POST /v1/evenements
 * @group evenement - gestion des évènements
 * @summary Insére un évènement en base de donnée
 * @param {evenement.model} evenement.body.required
 * @returns {JSON} 200 - Un évènement a été créé
 */
router.post('/evenements', validateBody(eventSchema, 'POST'), eventController.newEvent);
/**
 * Permet de créer un nouveau participant.
 * @route POST /v1/participants
 * @group evenement - gestion des évènements
 * @summary Insére un participant en base de donnée
 * @param {evenement.model} evenement.body.required
 * @returns {JSON} 200 - Un évènement a été créé
 */
router.post('/participants', validateBody(participantSchema), participantController.addParticipant);
/**
 * Permet d'annuler une participation.
 * @route PATCH /v1/participants
 * @group evenement - gestion des évènements
 * @summary Annule une participation en base de donnée
 * @param {evenement.model} evenement.body.required
 * @returns {JSON} 200 - Un évènement a été créé
 */
router.patch('/participants', participantController.cancelParticipant);
/**
* Permet de mettre à jour un évènement.
* @route PATCH /v1/evenements/:id
* @group evenement - gestion des évènements
* @summary Mets à jour un évènement en base de donnée
* @param {evenement.model} evenement.body.required
* @param {number} id.path.required - l'id à fournir
* @returns {JSON} 200 - Un évènement a été mis à jour
*/
router.patch('/evenements/:id(\\d+)', validateBody(eventSchema, 'PATCH'), eventController.updateEvent);
/**
 * Permet de supprimer un évènement.
 * @route DELETE /v1/evenements/:id
 * @group evenement - gestion des évènements
 * @summary Supprime un évènement en base de donnée
 * @param {evenement.model} evenement.body.required
 * @param {number} id.path.required - l'id à fournir
 * @returns {JSON} 200 - Un évènement a été supprimé
 */
router.delete('/evenements/:id(\\d+)', eventController.deleteEvent);
/**
 * Permet la déconnexion d'un utilisateur au site.
 * @route GET /v1/deconnexion
 * @group deconnexion - Pour se déconnecter
 * @summary déconnecte un utilisateur
 * @returns {JSON} 200 - Un utilisateur a bien été déconnecté
 */
router.get('/deconnexion', userController.deconnexion);
// Gestion des érreurs => Token invalid ou pas le bon role :
router.use((err, req, res, next) => {
  if (err.code === 'invalid_token') {
    console.log('Pas de token, pas de chocolat !');
    res.status(401).json('Token invalide, Merci de vous connecter.'); //Pour la prod => 401 UNAUTHORIZED - Invalid Token
  } else if (err.code === 'permission_denied') {
    res.status(403).json('Accés non autorisé ! Hé alors... on se prend pour un admin ?')
  } else if (err.code === 'revoked_token') {
    res.status(403).json('Vous êtes déconnecté.  Merci de vous reconnecter.')
  }
});


//! Toutes les routes en dessous de ce MW nécéssiteront une autorisation, c'est a dire la présence d'un token non révoqué dans leur headers. Les routes que l'on veut accessible également aux non inscrits, devront donc être placé au dessus.
//!-------------------------------------------------------------------------------------------------------
/**
 * Une méthode permettant la déconnexion en passant en ne reconnaissant plus le token come valide.
 * Ici, safety first ! Même si le token en front, est dérobé du Local storage, via une attaque XSS, l'attaquant ne pourra pas s'en reservir, l'API l'a invalidé lors de la déconnexion !
 * Renvoie un message en jsons confirmant la déconexion.
 * @method logout
 */
 const checkForPermissions = guard
  .check(['Administrateur'])

  router.use(checkForPermissions)
  //--------------------------------------------------------------------------------------------------------------
  /**
   * Affiche un utilisateur.
   * @route GET /v1/user/:id
   * @group user - gestion des utilisateurs
   * @summary Affiche un utilisateur en base de donnée
   * @param {user.Model} user.body.required
   * @param {number} id.path.required - l'id à fournir
   * @returns {JSON} 200 - Un utilisateur a été délivré
   */
   router.get('/user/:id(\\d+)', userController.getUserbyId);

  /**
   * Un utilisateur
   * @typedef {object} user
   * @property {number} id - id du jeu
   * @property {string} firstName - prénom
   * @property {string} lastName - nom de famille
   * @property {string} pseudo - pseudo
   * @property {string} emailAddress - email
   * @property {string} password - password
   * @property {string} inscription - date d'inscription
   * @property {string} avatar - chemin absolu jusqu' une image
   * @property {string} group_id - références a la table qui détient les rôles
   */

  /**
   * Affiche tous les utilisateurs.
   * @route GET /v1/user
   * @group user - gestion des utilisateurs
   * @summary Affiche tous les utilisateurs en base de donnée
   * @param {user.Model} user.body.required
   * @returns {JSON} 200 - Tous les utilisateurs ont été délivré
   */
  
  //Pour gérer les informations des users :
  router.get('/user', userController.getAllUser);

/**
 * Modifit les informations d'un utilisateur.
 * @route PATCH /v1/user/:id
 * @group user -  gestion des utilisateurs
 * @summary Modifit un utilisateur en base de donnée
 * @param {user.Model} user.body.required - les informations du user que l'on peut fournir
 * @param {number} id.path.required - l'id à fournir
 * @returns {JSON} 200 - les données d'un utilisateur ont été mis a jour
 */
 router.patch('/user/:id(\\d+)', userController.updateUser);

 /**
 * Supprime les informations d'un utilisateur.
 * @route DELETE /v1/user/:id
 * @group user - Les routes de notre API
 * @summary Supprimme un utilisateur en base de donnée
 * @param {user.Model} user.body.required
 * @param {number} id.path.required - l'id à fournir
 * @returns {JSON} 200 - les données d'un utilisateur ont été supprimées
 */
  router.delete('/user/:id(\\d+)', userController.deleteUserById);
/**
 * Redirection vers une page 404
 */
router.use((req, res) => {
  res.status(404).send('La route choisie n\'existe pas : http://localhost:3000/api-docs#/');
});
module.exports = router;