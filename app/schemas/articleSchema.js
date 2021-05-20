const Joi = require('joi');

/**
 * Valide les informations reçu dans le body et envoyé par les utilisateurs
 * @name articleSchema
 * @group Joi - Vérifie les informations du body
 * @property {string} title - le titre qu'un article doit avoir
 * @property {string} description - le contenu de l'article, celui-ci est obligatioire et doit avoir au minimum 15 caractères
 * @property {int} authorId - l'id de l'auteur de l'article
 * @property {int} tagId - l'id de la catégorie à laquelle appartient l'article
 * @return {json} messages - Un texte adapté a l'érreur en json, informant l'utilisateur d'un non respect des régles du schéma de validation
 */
const articleSchema = Joi.object({
  title: Joi.string().when('$requestType', { is: 'POST', then: Joi.required() }),
  description: Joi.string().min(15).when('$requestType', { is: 'POST', then: Joi.required() }),
  authorId: Joi.number().integer().positive().when('$requestType', { is: 'POST', then: Joi.required() }),
  tagId: Joi.number().integer().positive().when('$requestType', { is: 'POST', then: Joi.required() }),
});

module.exports = articleSchema;
