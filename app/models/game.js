const db = require('../database')

class Game {
  id;
  title;
  minPlayer;
  maxPlayer;
  minAge;
  duration;
  quantity;
  purchasedDate;
  creator;
  editor;
  description;
  year;
  typeId;
  gameType;
  gameCategories;
  tagHasGameId;

  set min_player(val) {
    this.minPlayer = val;
  }

  set max_player(val) {
    this.maxPlayer = val;
  }

  set min_age(val) {
    this.minAge = val;
  }

  set purchased_date(val) {
    this.purchasedDate = val;
  }

  set type_id(val) {
    this.typeId = val;
  }

  set game_type(val) {
    this.gameType = val;
  }

  set game_categories(val) {
    this.gameCategories = val;
  }

  set tag_has_game_id(val) {
    this.tagHasGameId = val;
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
  * Méthode chargé d'aller chercher toutes les informations relatives à tous les jeux
  * @returns - tous les jeux présent en BDD
  * @static - une méthode static
  * @async - une méthode asynchrone
  */
  static async findAll() {
    const { rows } = await db.query('SELECT * FROM complete_games');

    if (!rows[0]) {
      throw new Error("Il n'y a pas encore de jeux pour ce club ...");
    }

    return rows.map(game => new Game(game));
  }
  /**
  * Méthode chargé d'aller chercher les informations relatives à un jeux passé en paramétre
  * @param id - un id d'un jeux
  * @returns - les informations du jeux demandées
  * @static - une méthode static
  * @async - une méthode asynchrone
  */
  static async findOne(id) {
    const { rows } = await db.query('SELECT * FROM complete_games WHERE id=$1;', [id]);

    if (!rows[0]) {
      throw new Error(`Le jeu avec l'id ${id} n'existe pas`);
    }

    return new Game(rows[0]);
  }

  /**
  * Méthode chargé d'aller insérer les informations relatives à un jeu passé en paramétre
  * @param title - le titre du jeu
  * @param minPlayer - le nombre minimum de joueur nécessaire pour jouer au jeu
  * @param maxPlayer - le nombre maximum de joueur pour jouer au jeu
  * @param minAge - l'âge minimum pour pouvoir jouer au jeu
  * @param duration - la durée moyenne d'une partie
  * @param quantity - le nombre d'exemplaire du jeu que nous possédons
  * @param creator - le nom du créateur du jeu
  * @param editor - le nom de l'éditeur du jeu
  * @param description - la description du jeu
  * @param year - l'année de sortie du jeu
  * @param typeId - l'id du type (jeu de base ou DLC) du jeu
  * @param gameCategories - les noms des categories associées au jeu
  * @returns - les informations du jeu demandées
  * @async - une méthode asynchrone
  */
  async save() {
    const { rows } = await db.query(`SELECT * FROM new_game(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    );`, [
      this.title,
      this.minPlayer,
      this.maxPlayer,
      this.minAge,
      this.duration,
      this.quantity,
      this.creator,
      this.editor,
      this.description,
      this.year,
      this.typeId
    ]);

    this.id = rows[0].id;
    this.purchasedDate = rows[0].purchased_date;

    // Permet d'associer les catégories pour le nouveau jeu en insérant les informations dans la table d'association (tag_has_game)
    if (this.gameCategories) {
      const query = `INSERT INTO tag_has_game (game_id, tag_id)
      SELECT $1, id
      FROM game_tag WHERE name = $2
      RETURNING *;`;
      this.tagHasGameId = [];
      if (typeof gameCategories === "object") {
        for (const category of this.gameCategories) {
          const { rows } = await db.query(query, [this.id, category])
          this.tagHasGameId.push(rows[0].id);
        }
      } else {
        const { rows } = await db.query(query, [this.id, this.gameCategories]);
        this.tagHasGameId.push(rows[0].id);
      }
    }
  }

  /**
  * Méthode chargé d'aller mettre à jour les informations relatives à un jeu passé en paramétre
  * @param id - l'id du jeu
  * @param title - le titre du jeu
  * @param minPlayer - le nombre minimum de joueur nécessaire pour jouer au jeu
  * @param maxPlayer - le nombre maximum de joueur pour jouer au jeu
  * @param minAge - l'âge minimum pour pouvoir jouer au jeu
  * @param duration - la durée moyenne d'une partie
  * @param quantity - le nombre d'exemplaire du jeu que nous possédons
  * @param creator - le nom du créateur du jeu
  * @param editor - le nom de l'éditeur du jeu
  * @param description - la description du jeu
  * @param year - l'année de sortie du jeu
  * @param typeId - l'id du type (jeu de base ou DLC) du jeu
  * @param gameCategories - les noms des categories associées au jeu
  * @returns - les informations du jeu mis à jour
  * @async - une méthode asynchrone
  */
  async update() {
    await db.query('SELECT * FROM update_game($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);',
      [
        this.id,
        this.title,
        this.minPlayer,
        this.maxPlayer,
        this.minAge,
        this.duration,
        this.quantity,
        this.creator,
        this.editor,
        this.description,
        this.year,
        this.typeId
      ]);

    for (const tagHasGameId of this.tagHasGameId) {
      for (const category of this.gameCategories) {
        await db.query('UPDATE tag_has_game SET tag_id = game_tag.id FROM (SELECT id FROM game_tag WHERE name = $1) AS game_tag WHERE tag_has_game.id=$2;', [category, tagHasGameId]);
      }
    }
  }
  /**
  * Méthode chargé d'aller supprimer un jeux passé en paramétre
  * @param - un id d'un jeux
  * @async - une méthode asynchrone
  */
  async delete() {
    await db.query('DELETE FROM game WHERE id = $1;', [this.id]);
    await db.query('DELETE FROM tag_has_game WHERE game_id = $1;', [this.id]);
  }
}

module.exports = Game;
