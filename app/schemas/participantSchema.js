const Joi = require('joi');

/**
 * Valide les informations reçu dans le body et envoyé par les utilisateurs
 * @name participantSchema
 * @group Joi - Vérifie les informations du body
 * @property {int} id - l'id de l'évènement
 * @property {string} pseudo - le pseudo de l'utilisateur voulant s'inscrire à l'évènement
 * @return {json} messages - Un texte adapté a l'erreur en json, informant l'utilisateur d'un non respect des régles du schéma de validation
 */
const participantSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    pseudo: Joi.string().required()
});

module.exports = participantSchema;