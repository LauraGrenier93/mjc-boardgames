const { dayjs } = require('../services/date');
const Participant = require('../models/participant');
const Event = require('../models/event');
const User = require('../models/user');

const participantController = {
    /**
    * Une méthode qui prend en charge la création d'un nouvel participant dans la BDD
    * @name addParticipant
    * @property {int} id - l'id de l'évènement
    * @property {string} pseudo - le pseudo de l'utilisateur voulant participer à l'évènement
    * @param {Express.Request} request - l'objet représentant la requête
    * @param {Express.Response} response - l'objet représentant la réponse
    * @return {Object}  - Le noouveau participant sous forme d'objet JSON
    */
    addParticipant: async (req, res) => {
        try {
            const { pseudo, id } = req.body;
            const event = await Event.findOne(id);
            const user = await User.findByPseudo(pseudo);
            if (event && user) {
                try {
                    const participant = await Participant.findOne(event.id, user.id);
                    participant.cancelledDate = null;
                    await participant.update();
                    console.log(participant);
                    res.json(participant);
                } catch (error) {
                    const newParticipant = new Participant();
                    newParticipant.eventId = event.id;
                    newParticipant.userId = user.id;
                    await newParticipant.save();
                    res.json(newParticipant);
                    console.log(newParticipant)
                }
            }
        } catch (error) {
            console.log(`Erreur lors de l'enregistrement du participant: ${error.message}`);
            res.status(500).json(error.message);
        }
    },
    /**
    * Une méthode qui prend en charge l'annulation de participation d'un utilisateur dans la BDD
    * @name addParticipant
    * @property {int} id - l'id de l'évènement
    * @property {string} pseudo - le pseudo de l'utilisateur voulant participer à l'évènement
    * @param {Express.Request} request - l'objet représentant la requête
    * @param {Express.Response} response - l'objet représentant la réponse
    * @return {Object}  - Le noouveau participant sous forme d'objet JSON
    */
    cancelParticipant: async (req, res) => {
        try {
            const { pseudo, id } = req.body;
            const event = await Event.findOne(id);
            const user = await User.findByPseudo(pseudo);
            if (event && user) {
                const participant = await Participant.findOne(event.id, user.id);
                participant.cancelledDate = dayjs();
                await participant.update();
                res.json(participant);
                console.log(participant);
            }
        } catch (error) {
            console.log(`Erreur lors de l'annulation du participant: ${error.message}`);
            res.status(500).json(error.message);
        }
    }
};

module.exports = participantController;