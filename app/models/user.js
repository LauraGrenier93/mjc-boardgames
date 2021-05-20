const db = require('../database');

class User {

  id;
  firstName;
  lastName;
  pseudo;
  emailAddress;
  password;
  inscription;
  avatar;
  verifyemail;
  


  set first_name(val) {
    this.firstName = val;
  }

  set last_name(val) {
    this.lastName = val;
  }

  set email_address(val) {
    this.emailAddress = val;
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
* Méthode chargé d'aller chercher toutes les informations relatives à tous les utilisateurs
* @returns - tous les utilisateurs présent en BDD
* @static - une méthode static
* @async - une méthode asynchrone
*/
  static async findAll() {
    const {
      rows
    } = await db.query('SELECT * FROM "user" ;');

    if (!rows[0]) {
      throw new Error("Aucun user dans la BDD");
    }
    console.log(
      `les informations des ${rows.length} users a été demandé !`
    );

    return rows.map((user) => new User(user));
  }


/**
* Méthode chargé d'aller chercher les informations relatives à un utilisateur passé en paramétre
* @param - un id d'un utilisateur
* @returns - les informations de l'utilisateur demandées
* @static - une méthode static
* @async - une méthode asynchrone
*/
  static async findOne(id) {


    const {
      rows,
    } = await db.query(
      'SELECT * FROM "user" WHERE id = $1;',
      [id]
    );

    if (!rows[0]) {
      throw new Error("Aucun user avec cet id");
    }

    console.log(
      `l'user id : ${id} a été demandé !`
    );

    return new User(rows[0]);
  }



/**
* Méthode chargé d'aller chercher les informations relatives à un utilisateur passé en paramétre
* @param - un pseudo d'un utilisateur
* @returns - les informations de l'utilisateur demandées
* @static - une méthode static
* @async - une méthode asynchrone
*/
  static async findByPseudo(pseudo) {

    const {
      rows,
    } = await db.query(
      `SELECT "user".*, "group".name group_name FROM "user" 
            JOIN "group" ON "group".id="user".group_id
            WHERE "user".pseudo= $1;`,
      [pseudo]
    );

    if (!rows[0]) {
      console.log("Aucun user avec ce pseudo");
    } else {
      console.log(
        `l'user avec le pseudo : ${pseudo} a été demandé !`
      );
    }


    return new User(rows[0]);
  }

/**
* Méthode chargé d'aller chercher les informations relatives à un utilisateur passé en paramétre
* @param - un email d'un utilisateur
* @returns - les informations de l'utilisateur demandées
* @static - une méthode static
* @async - une méthode asynchrone
*/
  static async findByEmail(email) {

    const {
      rows,
    } = await db.query(
      'SELECT * FROM "user" WHERE "user".email_address= $1;',
      [email]
    );

    if (!rows[0]) {
      console.log("Cet email n'est pas enregistré dans la BDD.");
    } else(console.log(
      ` l'email : ${email} existe déja en BDD !`
    ))

    return new User(rows[0]);
  }
/**
* Méthode chargé d'aller insérer les informations relatives à un utilisateur passé en paramétre
* @param  firstName - le firstname d'un utilisateur
* @param  lastName - le firstname d'un utilisateur
* @param  pseudo - le pseudo d'un utilisateur
* @param  emailAddress - le emailAddress d'un utilisateur
* @param  password - le password d'un utilisateur
* @returns - les informations de l'utilisateur demandées
* @async - une méthode asynchrone
*/
  async save() {
    const {
      rows,
    } = await db.query(
      `INSERT INTO "user" (first_name, last_name, pseudo, email_address, password) VALUES ($1,$2,$3,$4,$5) RETURNING *;`,
      [this.firstName, this.lastName, this.pseudo, this.emailAddress, this.password]
    );
    
    this.id = rows[0].id;
    this.inscription = rows[0].inscription;
    console.log(
      `l'user ${this.id} avec comme nom ${this.firstName} ${this.lastName} a été inséré à la date du ${this.inscription} !`
    );
  }

  async update() {
    const {
      rows,
    } = await db.query(
      `UPDATE "user" SET  first_name= $1, last_name = $2, pseudo= $3, email_address= $4, password= $5, avatar= $6 WHERE id = $7 RETURNING *;`,
      [
        this.firstName,
        this.lastName,
        this.pseudo,
        this.emailAddress,
        this.password,
        this.avatar,
        this.id,
      ]
    );

    this.id = rows[0].id;
    console.log(
      `l'user id : ${this.id} avec comme nom ${this.firstName} ${this.lastName} a été mise à jour !`
    );
  }

  static async delete(id) {
    const {
      rows
    } = await db.query('DELETE FROM "user" WHERE id = $1 RETURNING *;', [
      id,
    ]);
    console.log(`l'user ${id} a été supprimé !`);

    return new User(rows[0]);
  }



  static async emailverified(id) {

    const {
      rows
    } = await db.query('UPDATE "user" SET verifyemail=TRUE WHERE id = $1 RETURNING verifyemail;', [
      id,
    ]);

    this.verifyemail = rows[0].verifyemail;
    console.log(`l'email de l'user id: ${id} a bien été vérifié et passé en statut ${this.verifyemail} !`);

    return new User(rows[0]);


  }
}
module.exports = User;
