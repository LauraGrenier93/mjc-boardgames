const Joi = require('joi');

/**
* Valide les informations reçu dans le body et envoyé par les utilisateurs
* @name articleSchema
* @group Joi - Vérifie les informations du body
* @property {string} title - le titre du jeu
* @property {int} minPlayer - le nombre minimum de joueur nécessaire pour jouer au jeu
* @property {int} maxPlayer - le nombre maximum de joueur pour jouer au jeu
* @property {int} minAge - l'âge minimum pour pouvoir jouer au jeu
* @property {int||object} duration - la durée moyenne d'une partie
* @property {int} quantity - le nombre d'exemplaire du jeu que nous possédons
* @property {string} creator - le nom du créateur du jeu
* @property {string} editor - le nom de l'éditeur du jeu
* @property {string} description - la description du jeu
* @property {int} year - l'année de sortie du jeu
* @property {int} typeId - l'id du type (jeu de base ou DLC) du jeu
* @property {string||array} gameCategories - les catégories du jeu
* @return {json} messages - Un texte adapté a l'érreur en json, informant l'utilisateur d'un non respect des régles du schéma de validation
*/
const gameSchema = Joi.object({
  title: Joi.string().when('$requestType', { is: 'POST', then: Joi.required() }),
  minPlayer: Joi.number().integer().positive().when('$requestType', { is: 'POST', then: Joi.required() }),
  maxPlayer: Joi.number().integer().positive().min(Joi.ref('minPlayer')).when('$requestType', { is: 'POST', then: Joi.required() }),
  minAge: Joi.number().integer().positive().min(0).max(100).when('$requestType', { is: 'POST', then: Joi.required() }),
  duration: [
    Joi.number().integer().positive().when('$requestType', { is: 'POST', then: Joi.required() }), // en minutes
    Joi.object({ // un objet avec des props hours et minutes
      hours: Joi.number().integer().positive().required(),
      minutes: Joi.number().integer().positive().required()
    }).when('$requestType', { is: 'POST', then: Joi.required() })
  ],
  quantity: Joi.number().integer().positive().when('$requestType', { is: 'POST', then: Joi.required() }),
  creator: Joi.string().when('$requestType', { is: 'POST', then: Joi.required() }),
  editor: Joi.string().when('$requestType', { is: 'POST', then: Joi.required() }),
  description: Joi.string().min(15).when('$requestType', { is: 'POST', then: Joi.required() }),
  year: Joi.number().integer().positive().min(1900).max(2100).when('$requestType', { is: 'POST', then: Joi.required() }),
  typeId: Joi.number().integer().positive().when('$requestType', { is: 'POST', then: Joi.required() }),
  gameCategories: [
    Joi.string().when('$requestType', { is: 'POST', then: Joi.required() }),
    Joi.array().items(Joi.string().required()).when('$requestType', { is: 'POST', then: Joi.required() })
  ]
});

module.exports = gameSchema;
