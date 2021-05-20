const db = require('../database');

class Participant {
    id;
    eventId;
    userId;
    inscriptionDate;
    cancelledDate;

    set event_id(val) {
        this.eventId = val;
    }

    set user_id(val) {
        this.userId = val;
    }

    set inscription_date(val) {
        this.inscriptionDate = val;
    }

    set cancelled_date(val) {
        this.cancelledDate = val;
    }

    /**
     * @constructor
     * @param {Object} data - objet contenant les valeur pour l'instance
     */
    constructor(data = {}) {
        for (const prop in data) {
            this[prop] = data[prop];
        }
    }
    /**
     * Méthode chargé d'aller chercher les informations relatives à un evenement passé en paramétre
     * @param eventId - id d'un évenement
     * @param userId - id d'un utilisateur
     * @returns - les informations du participant demandé
     * @static - une méthode static
     * @async - une méthode asynchrone
     */
    static async findOne(eventId, userId) {
        const { rows } = await db.query(`SELECT * FROM event_has_participant WHERE event_id = $1 AND user_id = $2;`, [eventId, userId]);

        if (!rows[0]) {
            throw new Error(`Cette personne ne s'est pas inscrit à cet évènement.`);
        }

        return new Participant(rows[0]);
    }
    /**
    * Méthode chargé d'aller insérer les informations relatives à un participant passé en paramétre
    * @param eventId - le titre du jeu
    * @param userId - l'id du user voulant s'inscrire
    * @returns - les informations du participant demandées
    * @async - une méthode asynchrone
    */
    async save() {
        const { rows } = await db.query(`INSERT INTO event_has_participant ("event_id", "user_id") VALUES ($1, $2) RETURNING *;`, [this.eventId, this.userId]);
        this.id = rows[0].id;
        this.inscriptionDate = rows[0].inscription_date;
    }

    /**
    * Méthode chargé d'aller mettre à jour la ligne cancelled_date relatives à un participant
    * @param cancelledDate - la date d'annulation de la participation
    * @returns - les informations du participant demandé
    * @async - une méthode asynchrone
    */
    async update() {
        await db.query('UPDATE event_has_participant SET cancelled_date = $1 WHERE id = $2;', [this.cancelledDate, this.id]);
    }
}

module.exports = Participant;