const Joi = require('joi');

/**
 * Valide les informations reçu dans le body et envoyé par les utilisateurs
 * @name eventSchema
 * @group Joi - Vérifie les informations du body
 * @property {string} title - le titre qu'un évènement doit avoir
 * @property {string} description - la description de l'évènement, celui-ci est obligatioire et doit avoir au minimum 15 caractères
 * @property {date} eventDate - la date à laquelle l'évènement aura lieu
 * @property {int} creatorId - l'id du créateur de l'évènement
 * @property {int} tagId - l'id de la catégorie à laquelle appartient l'évènement
 * @property {string||array} eventGames - les noms des jeux associées à l'événement
 * @return {json} messages - Un texte adapté à l'erreur en json, informant l'utilisateur d'un non respect des régles du schéma de validation
 */
const eventSchema = Joi.object({
  title: Joi.string().when('$requestType', { is: 'POST', then: Joi.required() }),
  description: Joi.string().min(15).when('$requestType', { is: 'POST', then: Joi.required() }),
  eventDate: Joi.date().when('$requestType', { is: 'POST', then: Joi.required() }),
  creatorId: Joi.number().integer().positive().when('$requestType', { is: 'POST', then: Joi.required() }),
  tagId: Joi.number().integer().positive().when('$requestType', { is: 'POST', then: Joi.required() }),
  eventGames: [
    Joi.string(),
    Joi.array().items(Joi.string().required())
  ]
});

module.exports = eventSchema;
