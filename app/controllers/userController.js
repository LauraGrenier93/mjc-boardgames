const User = require('../models/user');
const validator = require("email-validator");
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const randToken = require('rand-token');
const blacklist = require('express-jwt-blacklist');
blacklist.configure({
  tokenId: 'jti'
});
/**
 * Une variable d'environnement qui est présent dans le .env.back contenant la clé secréte utiisé pour générer le token
 * @param {Express.JWT_SECRET} - la clé secréte et sensible qui signe le token envoyé.
 */
const jwtSecret = process.env.JWT_SECRET;

/**
 * Le controller chargé de centraliser les appels a la base de données concernant les utilisateurs
 * Il gére également la connexion et et l'inscription des utilisateurs
 */
const userController = {
  /**
   * Methode chargé d'aller chercher les informations relatives à tous les utilisateurs
   * @param {Express.Request} req - l'objet représentant la requête
   * @param {Express.Response} res - l'objet représentant la réponse
   */
  getAllUser: async (req, res) => {
    try {
      const users = await User.findAll();

      res.json(users);
    } catch (error) {
      console.trace('Erreur dans la méthode getAllUser du userController :',
        error);
      res.status(500).json(error.message);
    }
  },
  /**
   * Methode chargé d'aller chercher les informations relatives à un utilisateur
   * @param {Express.Request} req - l'objet représentant la requête
   * @param {Express.Response} res - l'objet représentant la réponse
   * @param {req.params.id} req.params.id - le numéro identifiant un utilisateur précis
   */
  getUserbyId: async (req, res) => {
    try {
      const user = await User.findOne(req.params.id);
      res.json(user);

    } catch (error) {
      console.trace('Erreur dans la méthode getUserbyId du userController :',
        error);
      res.status(500).json(error.message);
    }
  },
  /**
   * Methode chargé de supprimer les informations relatives à un utilisateur
   * @param {Express.Request} req - l'objet représentant la requête
   * @param {Express.Response} res - l'objet représentant la réponse
   *  * @param {req.params.id} req.params.id - le numéro identifiant un utilisateur précis
   */
  deleteUserById: async (req, res) => {

    try {

      const userInDb = await User.findOne(req.params.id);

      id = userInDb.id

      const user = await User.delete(id);

      res.json(user);

    } catch (error) {
      console.trace('Erreur dans la méthode DeleteUserById du userController :',
        error);
      res.status(500).json(error.message);
    }
  },
  //!------------------------GESTION DES FORMULAIRES-------------------------------------------------
  /**
 * Une méthode qui prend en charge la connexion d'un utilisateur déja inscrit dans la BDD
 * Une méthode qui vérifit que l'utilisateur existe en BDD et compare son mot de passe avec son hash présent en BDD via bcrypt
 * Retourne un Token, un valeur true ou false pour "logged" et le pseudo de l'utilisateur 
 * @name handleLoginForm
 * @method handleLoginForm
 * @property {string} pseudo - le pseudo qu'un utilisateur utilise pour se connecter, doit être unique en BDD et inséré dans le formulaire de connexion.
 * @property {string} password - le mot de passe qu'un utilisateur utilise pour se connecter.
 * @param {Express.Request} request - l'objet représentant la requête
 * @param {Express.Response} response - l'objet représentant la réponse
 * @return {String}  - Un token construit via la méthod sign du package jsonwebtoken
 * @return {boolean} - une valeur de connexion true ou false
 */
  handleLoginForm: async (request, response) => {
    try {
      //on cherche à identifier le user à partir de son pseudo
      const pseudo = request.sanitize(request.body.pseudo);
      const userInDb = await User.findByPseudo(pseudo);
      console.log('user InDb => ', userInDb);
      //si aucun user trouvé avec ce pseudo => message d'erreur
      if (typeof userInDb.id === 'undefined') {
        return response.status(404).json("Aucun utilisateur avec ce pseudo");
      }
      //le user avec ce pseudo existe, on vérifie son mot de passe en comparant :
      //- la version en clair saisie dans le formulaire
      //- la version hachée stockée en BDD
      //bcrypt est capable de déterminer si les 2 version du mot de passe correcpondent
      const {
        password
      } = request.body;
      const passwordInDb = userInDb.password;
      console.log(await bcrypt.compare(password, passwordInDb));
      /**
       * si la comparaison du password avec son hash en BDD correspond, le pseudo, la valeur de logged et le token sera envoyé en retour
       */
      if (!await bcrypt.compare(password, passwordInDb)) {
        console.log("La vérification du mot de passe a échoué !")
        return response.status(403).json({
          error: 'la vérification du mot de passe a échoué !'
        })
      }

        /** 
         * Pour révoquer un Token, on dois être capable de différencier un token d'un autre. Les spec de JWT propose d'utiliser jti comme identifier de token.
         * Fichier json qui sera présent dans le token
         * @type {json}
         * 
         */
        const jwtContent = {
          userId: userInDb.id,
          permissions: [`${userInDb.group_name}`],
          jti: userInDb.pseudo + "_" + randToken.generator({
            chars: '0-9'
          }).generate(6)
        };
        console.log("jwtContent.jti => ", jwtContent.jti);
        /** 
         * Fichier json representant les options de configuration token et notamment le type de chiffrement et la durée du Token
         * @type {json}
         * 
         */
        const jwtOptions = {
          algorithm: 'HS256',
          expiresIn: '3h' // ExpireIn est par default en seconde. Ici définit à 3 heures.
        };
        /** 
         *Fichier json representant le retour de la méthode handleLoginForm dans le cad d'une connexion réussie
         * @type {json}
         * 
         */
        response.status(200).json({
          logged: true,
          pseudo: userInDb.pseudo,
          firstname: userInDb.firstName,
          lastname: userInDb.lastName,
          email: userInDb.emailAddress,
          role: userInDb.group_name,
          id:userInDb.id,
          token: jsonwebtoken.sign(jwtContent, jwtSecret, jwtOptions),
        });
        console.log(`L'utilisateur ${userInDb.firstName} ${userInDb.lastName} a bien été authentifié. Voici son token : ${
          jsonwebtoken.sign(jwtContent, jwtSecret, jwtOptions)} `);
        /**
         * Si l'utilisateur est bien identifé, on stocke dans la session les informations de connexion de l'utilisateur et son role
         * @type {json}
         */
        request.session.user = {
          firstname: userInDb.firstName,
          lastname: userInDb.lastName,
          email: userInDb.emailAddress,
          pseudo: userInDb.pseudo,
          role: userInDb.group_name,
        };
    } catch (error) {
      console.trace('Erreur dans la méthode handleLoginForm du userController :',
        error);
      response.status(500).json(error.message);
    }

  },
  /**
   * Une méthode qui prend en charge l'inscription d'un utilisateur dans la BDD
   * Une méthode qui vérifit que l'adresse email de l'utilisateur n'existe pas en BDD, vérifit la validité de son email, la robustesse de son mot de passe
   * Hash son mot de passe et insére l'ensemble de ses informations en BDD
   * @name handleSignupForm
   * @method handleSignupForm
   * @property {string} fisrtName - Le firstname de l'utilisateur, devant contenir au minimum 2 caractéres, sans espaces.
   * @property {string} lastName - le lastname de l'utilisateur devant contenir au minimum 2 caractéres, sans espaces.
   * @property {string} emailAddress - l'adresse email d'un utilisateur, ne doit pas déja être enrgistré en BDD et correspondre a un format valide
   * @property {string} pseudo - le pseudo qu'un utilisateur utilise pour se connecter, ne doit pas être identique a un autre pseudo et contenir au minimum 3 caractéres et 40 au maximum, sans espace. 
   * @property {string} password - le mot de passe d'un utilisateur, doit avoir 8 caractéres au minimum, une lettre minuscule, une lettre majuscule, un nombre et un caractéres spécial parmis : (@#$%^&*)
   * @property {string} passwordConfirm - doit être identique au password
   * @param {Express.Request} request - l'objet représentant la requête
   * @param {Express.Response} response - l'objet représentant la réponse
   * @return {String}  - Un texte en json informant de la rentré en BDD d'un nouveau utilisateur.
   */
  handleSignupForm: async (request, response) => {
    try {
      console.log("request.body =>", request.body);
      //on check si un utilisateur existe déjà avec cet email
      const email = request.sanitize(request.body.emailAddress);
      const pseudo = request.sanitize(request.body.pseudo);

      // vérif de sécurité en plus de la REGEX de Joi et de expressSanitizer
      console.log("request.body.emailAddress => ", email);
      //on ne recherche que l'email a un format valide
      if (!validator.validate(email)) {
        //le format de l'email est incorrect
        return response.json('Le format de l\'email est incorrect');
      }
      const userInDb = await User.findByEmail(email);
      // on check l'email :
      if (userInDb.emailAddress) {
        //il y a déjà un utilisateur avec cet email, on envoie une erreur
        return response.json('Cet email n\'est pas disponible');
      }
      // on check le pseudo :
      const pseudoInDb = await User.findByPseudo(pseudo);
      if (pseudoInDb.pseudo) {
        //il y a déjà un utilisateur avec cet email, on envoie une erreur
        return response.json('Ce pseudo n\'est pas disponible');
      }
      //on checke si le password et la vérif sont bien identiques
      if (request.body.password !== request.body.passwordConfirm) {
        return response.json(
          'La confirmation du mot de passe est incorrecte'
        );
      }
      // on est OK pour une inscription en BDD ! hash du MDP => insertion en BDD
      /**
       * Une fonction asynchrone qui hash le mot de passe du nouvel utilisateur avant de l'insérer dans la BDD
       * @name hashedPwd
       * @function
       */
      const hashedPwd = await bcrypt.hash(request.body.password, 10)
      console.log(request.body.password, 'est devenu', hashedPwd);
      /**ff
       * Un fichier json qui contient les informations de l'utilisateur préparé pour être inséré en BDD
       * @type {json} 
       */
      const newUser = {
        pseudo: request.body.pseudo,
        emailAddress: request.body.emailAddress,
        password: hashedPwd,
        lastName: request.body.lastName,
        firstName: request.body.firstName,
      };
      console.log("newUser => ", newUser);
      /**
       * On créer une nouvelle instance de User 
       * */
      const userNowInDb = new User(newUser);
      console.log("userNowInDb => ", userNowInDb);
      /**
       * On l'envoie en BDD pour être enregistré
       */
      await userNowInDb.save();
      // on renvoie un messge au FRONT !
      console.log("userNowInDb =>", userNowInDb)
      response.status(200).json({
        pseudo: userNowInDb.pseudo,
        firstName: userNowInDb.firstName,
        lastName: userNowInDb.lastName,
        message: "Merci de valider votre email en cliquant sur le lien envoyé avant de vous connecter."
      });
      console.log(`L'user ${newUser.firstName} ${newUser.lastName} est désormais enregistré dans la BDD sans que sont email soit enregistré. `);
  
    } catch (error) {
      console.trace(
        'Erreur dans la méthode handleSignupForm du userController :',
        error);
      response.status(500).json(error.message);
    }
  },
  /**
   * méthode de déconnexion
   * @param {string} req 
   * @param {string} res 
   */
  deconnexion: async (req, res) => {
    try {
      blacklist.revoke(req.user);
      res.status(200).json("l'utilisateur a bien été déconnecté");
    } catch (error) {
      console.trace(
        'Erreur dans la méthode deconnexion du userController :',
        error);
      response.status(500).json(error.message);
    }
  },
  /**
   * Methode chargé d'aller mettre a jour les informations relatives à un utilisateur
   * @param {Express.Request} req - l'objet représentant la requête
   * @param {Express.Response} res - l'objet représentant la réponse
   * @param {req.params.id} req.params.id - le numéro identifiant un utilisateur précis
   */
  updateUser: async (req, res) => {
    try {
      //on vérifie si le user existe en BDD via à son ID
      const id = req.params.id;
      const userIdinDb = await User.findOne(id);
      // on extrait les infos du body //
      const {
        pseudo,
        firstName,
        lastName,
        password,
        avatar,
        newPassword,
        newPasswordConfirm,
        emailAddress
      } = req.body;
      // on vérifit si l'utilisateur existe en BDD
      if (!userIdinDb.id === 'undefined' && userIdinDb.emailAddress === 'undefined') {
        console.log(`Cet utilisateur n'est pas enregistré en base de données`)
        return res.status(404).json(`Cet utilisateur n'est pas enregistré en base de données`);
      }
      // on vérifit que l'utilisateur est bien authentifié .
      if (!await bcrypt.compare(password, userIdinDb.password)) {
        console.log("La vérification du mot de passe a échoué !")
        return res.status(403).json({
          error: 'L\'authentification a échoué !'
        })
      }
      //on check si le password et la vérif sont bien identiques
      if (newPassword !== newPasswordConfirm) {
        console.log("confirmation du nouveau mot de passe incorect")
        return res.json(
          'La confirmation du nouveau mot de passe est incorrecte'
        );
      }
      if (newPassword === password) {
        console.log("Le nouveau mot de passe n'a pas grand chose de nouveau..");

      }
      // on ne change que les paramètres envoyés mais on garde l'id a tous les coup.
      let updateUserInfo = {};
      updateUserInfo.id = userIdinDb.id;
      if (pseudo) {
        updateUserInfo.pseudo = pseudo;
      }
      if (firstName) {
        updateUserInfo.firstName = firstName;
      }
      if (lastName) {
        updateUserInfo.lastName = lastName;
      }
      //! gestion de l'avatar avecune une banque d'image ?
      if (avatar) {
        updateUserInfo.avatar = avatar;
      }
      // on vérifit l'email
      if (emailAddress && validator.validate(emailAddress)) {
        updateUserInfo.emailAddress = emailAddress;
        console.log("Votre mail est modifié.");
      } else {
        console.log("Votre ancien mail est conservé.");
        updateUserInfo.emailAddress = userIdinDb.emailAddress;
      }
      // on vérifit le password : si un nouveau est inséré, on le compare à la confirmation, on le hash et on le met dans l'objet.
      if (newPassword && newPassword !== userIdinDb.password && newPassword === newPasswordConfirm) {
        console.log("le changement du mot de passe est demandé. Un nouveau mot de passe valide a été proposé")
        const hashedPwd = await bcrypt.hash(newPassword, 10);
        console.log(newPassword, 'est devenu', hashedPwd);
        updateUserInfo.password = hashedPwd;
      } else {
        console.log("l'ancien mot de passe est conservé.")
        updateUserInfo.password = userIdinDb.password;
      }
      console.log('updateUserInfo => ', updateUserInfo);
      const newUser = new User(updateUserInfo);
      await newUser.update();
       console.log("le newUser in DB => ", newUser);
      res.json(newUser.id, newUser.firstName, newUser.lastName, newUser.pseudo, newUser.avatar);
      console.log(`L'utilisateur avec l'id : ${newUser.id} et le pseudo ${newUser.pseudo}, a bien été modifié.`);
    } catch (error) {
      res.status(500).json(error.message);
      console.log("Erreur dans la modification d'un utilisateur : ", error);
    }
  },
}
module.exports = userController;