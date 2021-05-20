const db = require('../database');

class Event {
  id;
  title;
  description;
  eventDate;
  createdDate;
  updateDate;
  creatorId;
  tagId;
  eventTag;
  creatorPseudo;
  eventParticipants;
  eventGames;
  eventHasGameId;

  set event_date(val) {
    this.eventDate = val;
  }

  set created_date(val) {
    this.createdDate = val;
  }

  set update_date(val) {
    this.updateDate = val;
  }

  set creator_id(val) {
    this.creatorId = val;
  }

  set tag_id(val) {
    this.tagId = val;
  }

  set event_tag(val) {
    this.eventTag = val;
  }

  set creator_pseudo(val) {
    this.creatorPseudo = val;
  }

  set event_participants(val) {
    this.eventParticipants = val;
  }

  set event_games(val) {
    this.eventGames = val;
  }

  set event_has_game_id(val) {
    this.eventHasGameId = val;
  }
  /**
   * @constructor
   */
  constructor(data = {}) {
    for (const prop in data) {
      this[prop] = data[prop];
    }
  }
  /**
  * Méthode chargé d'aller chercher toutes les informations relatives à tous les évenements
  * @returns - tous les évenements présent en BDD
  * @static - une méthode static
  * @async - une méthode asynchrone
  */
  static async findAll() {
    const { rows } = await db.query('SELECT * FROM complete_events ORDER BY id DESC;');

    if (!rows[0]) {
      throw new Error("Il n'y a pas d'évenement en BDD");
    }

    return rows.map(event => new Event(event));
  }
  /**
  * Méthode chargé d'aller chercher les informations relatives à un evenement passé en paramétre
  * @param id - id d'un évenement
  * @returns - les informations de l'évenement demandées
  * @static - une méthode static
  * @async - une méthode asynchrone
  */
  static async findOne(id) {
    const { rows } = await db.query('SELECT * FROM complete_events WHERE id=$1;', [id]);

    if (!rows[0]) {
      throw new Error(`L'événement avec l'id ${id} n'existe pas`);
    }

    return new Event(rows[0]);
  }

  /**
  * Méthode chargé d'aller insérer les informations relatives à un évènement passé en paramétre
  * @param title - le titre de l'événement
  * @param description - la description de l'évènement
  * @param eventDate - la date à laquelle l'évènement aura lieu
  * @param creatorId - l'id du créateur de l'évènement
  * @param tagId - l'id de du tag de l'évènement
  * @param eventGames - les noms des jeux associées à l'événement
  * @returns - les informations de l'évènement demandées
  * @async - une méthode asynchrone
  */
  async save() {
    const { rows } = await db.query('SELECT * FROM new_event($1, $2, $3, $4, $5);', [this.title, this.description, this.eventDate, this.creatorId, this.tagId]);
    this.id = rows[0].id;
    this.createdDate = rows[0].created_date;

    // Permet d'associer les jeux pour l'évènement en insérant les informations dans la table d'association (event_has_game)
    if (this.eventGames) {
      const query = `INSERT INTO event_has_game (event_id, game_id)
      SELECT $1, id
      FROM game WHERE title = $2
      RETURNING *;`;
      this.eventHasGameId = [];
      if (typeof eventGames === "object") {
        for (const game of this.eventGames) {
          const { rows } = await db.query(query, [this.id, game]);
          this.eventHasGameId.push(rows[0].id);
        }
      } else {
        const { rows } = await db.query(query, [this.id, this.eventGames]);
        this.eventHasGameId.push(rows[0].id);
      }
    }
  }

  /**
  * Méthode chargé d'aller mettre à jour les informations relatives à un évènement passé en paramétre
  * @param id - l'id de l'évènement
  * @param title - le titre de l'événement
  * @param description - la description de l'évènement
  * @param eventDate - la date à laquelle l'évènement aura lieu
  * @param creatorId - l'id du créateur de l'évènement
  * @param tagId - l'id de du tag de l'évènement
  * @param eventGames - les noms des jeux associées à l'événement
  * @returns - les informations de l'évènement demandées
  * @async - une méthode asynchrone
  */
  async update() {
    await db.query('SELECT * FROM update_event($1, $2, $3, $4, $5);', [this.id, this.title, this.description, this.eventDate, this.tagId]);

    for (const eventHasGameId of this.eventHasGameId) {
      for (const game of this.eventGames) {
        await db.query('UPDATE event_has_game SET game_id = game.id FROM (SELECT id FROM game WHERE title = $1) AS game WHERE event_has_game.id=$2;', [game, eventHasGameId]);
      }
    }
  }
  /**
  * Méthode chargé d'aller supprimer un evenement passé en paramétre
  * @param id - id d'un évenement
  * @async - une méthode asynchrone
  */
  async delete() {
    await db.query('DELETE FROM event WHERE id = $1;', [this.id]);
    await db.query('DELETE FROM event_has_game WHERE event_id = $1;', [this.id]);
    await db.query('DELETE FROM event_has_participant WHERE event_id = $1;', [this.id]);
  }
}

module.exports = Event;
