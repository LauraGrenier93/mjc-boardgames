const db = require('../database');

class Article {
  id;
  title;
  description;
  createdDate;
  updateDate;
  authorId;
  authorPseudo;
  authorAvatar;
  tagId;
  tagName;

  set created_date(val) {
    this.createdDate = val;
  }

  set update_date(val) {
    this.updateDate = val;
  }

  set author_id(val) {
    this.authorId = val;
  }

  set author_avatar(val) {
    this.authorAvatar = val;
  }

  set author_pseudo(val) {
    this.authorPseudo = val;
  }

  set tag_id(val) {
    this.tagId = val;
  }

  set tag_name(val) {
    this.tagName = val;
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
  * Méthode chargé d'aller chercher toutes les informations relatives à tous les articles
  * @returns - tous les articles présent en BDD
  * @static - une méthode static
  * @async - une méthode asynchrone
  */
  static async findAll() {
    const { rows } = await db.query('SELECT * FROM complete_articles ORDER BY id DESC;');

    if (!rows[0]) {
      throw new Error("Le site n'a pas encore d'article");
    }

    return rows.map(article => new Article(article));
  }
  /**
  * Méthode chargé d'aller chercher les informations relatives à un article passé en paramétre
  * @param id - l'id d'un article
  * @returns - les informations de l'article demandées
  * @static - une méthode static
  * @async - une méthode asynchrone
  */
  static async findOne(id) {
    const { rows } = await db.query('SELECT * FROM complete_articles WHERE id=$1;', [id]);

    if (!rows[0]) {
      throw new Error(`L'article avec l'id ${id} n'existe pas`);
    }

    return new Article(rows[0]);
  }

  /**
  * Méthode chargé d'aller insérer les informations relatives à un article passé en paramétre
  * @param  title - le titre de l'article
  * @param  description - le contenu de l'article
  * @param  authorId - l'id de l'auteur
  * @param  tagId - l'id de du tag de l'article
  * @returns - les informations de l'utilisateur demandées
  * @async - une méthode asynchrone
  */
  async save() {
    //je réalise des requêtes préparées pour sauvegarder un articles en utilisant des setters pour modifier la valeur
    // le setter permet d'autoriser les modifcations que pour la variable égal à cette valeur
    const { rows } = await db.query('SELECT * FROM new_article($1, $2, $3, $4);', [this.title, this.description, this.authorId, this.tagId]);
    this.id = rows[0].id;
    this.createdDate = rows[0].created_date;
  }

  /**
  * Méthode chargé d'aller mettre à jour les informations relatives à un article passé en paramétre
  * @param id - l'id de l'article
  * @param title - le titre de l'article
  * @param description - le contenu de l'article
  * @param authorId - l'id de l'auteur
  * @param tagId - l'id de du tag de l'article
  * @returns - les informations de l'utilisateur mis à jour
  * @async - une méthode asynchrone
  */
  async update() {
    await db.query('SELECT * FROM update_article($1, $2, $3, $4, $5);', [this.id, this.title, this.description, this.authorId, this.tagId]);
  }
  /**
  * Méthode chargé d'aller supprimer un article passé en paramétre
  * @param id - l'id d'un article
  * @async - une méthode asynchrone
  */
  async delete() {
    await db.query('DELETE FROM article WHERE id = $1;', [this.id]);
  }
}

module.exports = Article;
