// doc JOI => https://joi.dev/api/?v=17.4.0

const Joi = require('joi');

const resendEmailLinkSchema = Joi.object({
    userId: Joi.number().integer().positive()
        .required()
        .messages({
            'string.empty': `UserId doit être présent !`,
        }),
    token: Joi.string()
        .pattern(new RegExp(/^[A-Za-z0-9._-]{20,}$/))
        .required()
        .messages({
            'string.empty': `Le token doit être présent!`,
            'string.pattern.base':'Votre format de token est incorrect !',
        }),

}).with('userId', 'token');

module.exports = resendEmailLinkSchema;