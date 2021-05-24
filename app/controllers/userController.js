const User = require('../models/user');
const validator = require("email-validator");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
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
      //ici si l'utilisateur a bien vérifié son email (TRUE)
      if (userInDb.verifyemail) {
        console.log("La vérification du mot de passe a réussi !")
        console.log("userInDb.id => ", userInDb.id)
        console.log("userInDb.group_name =>", userInDb.group_name);
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
      } else {
        console.log("Accés non autorisé : Merci de vérifier votre email en cliquant sur le lien dans l'email envoyé.");
        /**df
         * @return {String} - En cas d'échec de l'autentification on renvoie le statue de l'érreur et une explication en json 
         */
        response.status(401).json("Accés non autorisé : Merci de vérifier votre email en cliquant sur le lien dans l'email envoyé lors de l'inscription.");
      }
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
      //! on envoie un mail pour vérifier l'email de l'utilisateur 
      // on va envoyer un token via la query avec dans le token, des infos sur l'émmetteur et le recepteur, donc quand on décode le token apres le clique du user sur notre endpoint, et qu'on rteouve ces infos, bingo, c'est bien le 
      const jwtOptions = {
        issuer: userNowInDb.pseudo,
        audience: 'Lesgardiensdelalégende',
        algorithm: 'HS256',
        expiresIn: '24h' // ExpireIn est par default en seconde. Ici définit à 3 heures.
      };
      const jwtContent = {
        userId: userNowInDb.id,
        jti: userNowInDb.id + "_" + randToken.generator({
          chars: '0-9'
        }).generate(6)

      };
      const newToken = jsonwebtoken.sign(jwtContent, jwtSecret, jwtOptions);
      async function main() {
        //on génére un compte de service SMTP
        // je créer un objet "transporteur" réutilisable à l'aide du transport SMTP par défaut
        // (Pour tester sans créer d'email => https://mailtrap.io/ : config pour mailtrap dans mes notes !)
        //ici le test est avec une adresse mail test créer nodeMailer : lesgardiensdelalegende@gmail.com => code accés dans slack. On voit les messages envoyés via nodemailer dans les "messages envoyés" 
        const host = request.get('host');
        const link = `http://${host}/v1/verifyEmail?userId=${userNowInDb.id}&token=${newToken}`;
        console.log("req.get =>", request.get);
        console.log("ici host vaut =>", host);
        console.log("ici link vaut => ", link);
        console.log("newToken => ", newToken);
        console.log("request.body.firstName => ", request.body.firstName);
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL, // L'adresse mail qui va servir pour l'envoi, mais elle n'est pas visible par le destinataire ! Ces accés sont à coller dans le .env.back et sont présent sur le slack.
            pass: process.env.PASSWORD_EMAIL, // Le mot de passe qui va avec 
          },
        });
        // l'envoie d'email définit par l'object "transporter"
        const info = await transporter.sendMail({
          from: 'lesgardiensdelalegende@gmail.com', //l'envoyeur
          to: `${request.body.emailAddress}`, // le ou les receveurs => `${request.body.emailAddress}`
          subject: `Les gardiens de la légende : merci de confirmer votre email`, // le sujet du mail
          text: `Bonjour ${request.body.firstName} ${request.body.lastName}, merci de cliquer sur le lien pour vérifier votre email auprés du club de jeu Les gardiens de la légende.`, // l'envoie du message en format "plain text" ET HTML, permet plus de souplesse pour le receveur, tout le monde n'accepte pas le format html pour des raisons de sécurité sur ces boites mails, moi le premier ! 
          html: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css"
          integrity="sha512-NmLkDIU1C/C88wi324HBc+S2kLhi08PN5GDeUVVVC/BVt/9Izdsc9SVeVfA1UZbY3sHUlDSyRXhCzHfr6hmPPw=="
          crossorigin="anonymous" />
      <style>
      h3 {
        font-size: 1.5rem;
    }
    body {
        background-color: rgb(253, 232, 175);
    }
    .background {
        display: flex
    }
    .medieval {
        border-radius: 8px;
        max-height: 500px;
        height: 300px;
        width: 1500px;
        max-width: 100%;
    }
    .montext {
        padding: 2rem 0 0 2rem;
    }
    a { 
      padding: 1rem 0 0 0;
    }
      </style>
      <body>
          <div class="background">
      
              <a href="http://localhost:8080"> <img class="medieval"
                      src="https://eapi.pcloud.com/getpubthumb?code=XZlztkZqnIb2V9qFI4z3M5DI9gDBQIu0TfX&linkpassword=undefined&size=870x217&crop=0&type=auto"
                      alt="medieval"> </a>
          </div>
                <div class="montext">
              <h3>Bonjour <span class="username"> ${newUser.firstName} ${newUser.lastName}, </span> </h3> <br>
              <p>Vous souhaitez vous inscrire au club de jeux des gardiens de la legende.</p> <br> 
              <p>Merci de cliquer sur le lien pour vérifier votre email auprés du club de jeu Les gardiens de la légende. </p> <br>
              <a href="${link}">cliquez ici pour vérifier votre email. </a> <br>
              <p>L'administrateur du site Les gardiens de la légende.</p> <br>
              <a href="http://localhost:8080"> Les gardiens de la légendes</a>
                </div>
            </body>`,
        });
        console.log("Message sent: %s", info.messageId);
        // le message envoyé ressemble a ça : <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        console.log(`Un email de vérification bien envoyé a ${newUser.firstName} ${newUser.lastName} via l'adresse email: ${newUser.emailAddress} : ${info.response}`);
        // Email bien envoyé : 250 2.0.0 OK  1615639005 y16sm12341865wrh.3 - gsmtp => si tout va bien !
      }
      main().catch(console.error);
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
      //! ici envoie d'un mail pour confirmer le changement d'information au user ! ----------------------------------
      // On est déja dans une fonction async mais si je ne redéfinit pas la portée j'ai pas les érreurs et console.log ! je dois utiliser un subterfuge !
      async function main() {
        //on généree un compte de service SMTP
        // je créer un objet "transporteur" réutilisable à l'aide du transport SMTP par défaut
        // (Pour tester sans créer d'email => https://mailtrap.io/ : config pour mailtrap dans mes notes !)
        //ici le test est avec une adresse mail test créer nodeMailer : lesgardiensdelalegende@gmail.com => code accés dans slack. On voit les messages envoyés via nodemailer dans les "messages envoyés" 
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL, // L'adresse mail qui va servir pour l'envoi, mais elle n'est pas visible par le destinataire ! Ces accés sont à coller dans le .env.back et sont présent sur le slack.
            pass: process.env.PASSWORD_EMAIL, // Le mot de passe qui va avec 
          },
        });
        // l'envoie d'email définit par l'object "transporter"
        const info = await transporter.sendMail({
          from: 'lesgardiensdelalegende@gmail.com', //l'envoyeur
          to: `${newUser.emailAddress}`, // le ou les receveurs => `${newUser.emailAddress}`
          subject: `Vos modification d'information sur le site des Gardiens de la légende à été pris en compte ! ✔`, // le sujet du mail
          text: `Bonjour ${newUser.firstName} ${newUser.lastName},
          Vous êtes membre du club de jeux des gardiens de la legendes.
          Vous avez récemment changé vos informations personnelles dans la configuration de votre compte. 😊 
          Vos changement ont bien été pris en compte ! ✔️
          En vous remerciant et en espérant vous revoir bientôt autour d'un jeu ! 🤗
          Bonne journée.
          L'administrateur du site Les gardiens de la légende.`, // l'envoie du message en format "plain text" ET HTML, permet plus de souplesse pour le receveur, tout le monde n'accepte pas le format html pour des raisons de sécurité sur ces boites mails, moi le premier ! 
          html: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css"
          integrity="sha512-NmLkDIU1C/C88wi324HBc+S2kLhi08PN5GDeUVVVC/BVt/9Izdsc9SVeVfA1UZbY3sHUlDSyRXhCzHfr6hmPPw=="
          crossorigin="anonymous" />
      <style>
      h3 {
        font-size: 1.5rem;
    }
    body {
        background-color: rgb(253, 232, 175);
    }
    .background {
        display: flex
    }
    .medieval {
        border-radius: 8px;
        max-height: 500px;
        height: 300px;
        width: 1500px;
        max-width: 100%;
    }
    .montext {
        padding: 2rem 0 0 2rem;
    }
      </style>
      <body>
          <div class="background">
      
              <a href="http://localhost:8080"> <img class="medieval"
                      src="https://eapi.pcloud.com/getpubthumb?code=XZlztkZqnIb2V9qFI4z3M5DI9gDBQIu0TfX&linkpassword=undefined&size=870x217&crop=0&type=auto"
                      alt="medieval"> </a>
          </div>
                <div class="montext">
              <h3>Bonjour <span class="username"> ${newUser.firstName} ${newUser.lastName}, </span> </h3> <br>
              <p>Vous êtes membre du club de jeux des gardiens de la legendes.</p>
              <p>Vous avez récemment changé vos informations personnelles dans la configuration de votre compte. 😊 </p>
              <p> Vos
                  changement ont bien été pris en compte ! ✔️ </p> <br>
              <p>En vous remerciant et en espérant vous revoir bientôt autour d'un jeu ! 🤗</p>
              <p> Bonne journée.</p> <br>
      
              <p>L'administrateur du site Les gardiens de la légende.</p> <br>
              <a href="http://localhost:8080"> Les gardiens de la légendes</a>
      
          </div>
            </body>`, // le contenu du mail en format html.
        });
        console.log("Message sent: %s", info.messageId);
        // le message envoyé ressemble a ça : <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        console.log(`Email bien envoyé a ${newUser.firstName} ${newUser.lastName} via l'adresse email: ${newUser.emailAddress} : ${info.response}`);
        // Email bien envoyé : 250 2.0.0 OK  1615639005 y16sm12341865wrh.3 - gsmtp => si tout va bien !
      }
      main().catch("Erreur lors de l'envois du mail dans la méthode updateUser", console.error);
      console.log("le newUser in DB => ", newUser);
      res.json(newUser.id, newUser.firstName, newUser.lastName, newUser.pseudo, newUser.avatar);
      console.log(`L'utilisateur avec l'id : ${newUser.id} et le pseudo ${newUser.pseudo}, a bien été modifié.`);
    } catch (error) {
      res.status(500).json(error.message);
      console.log("Erreur dans la modification d'un utilisateur : ", error);
    }
  },
  verifyEmail: async (req, res, err) => {
    try {
      const {
        userId,
        token
      } = req.query;
      console.log("userId =>", userId);
      console.log("secretCode =>", token)
      const userInDb = await User.findOne(userId);
      console.log("userInDb.emailverified =>", userInDb.verifyemail);
      const decodedToken = await jsonwebtoken.verify(token, jwtSecret, {
        audience: 'Lesgardiensdelalégende',
        issuer: `${userInDb.pseudo}`
      }, function (err, decoded) {
        if (err) {
          res.json("la validation de votre email a échoué", err)
        }
        return decoded
      });
      console.log("decode =>", decodedToken)
      console.log("userId =>", userId);
      if (userInDb.verifyemail) {
        console.log(`Le mail ${userInDb.emailAddress} à déja été authentifié avec succés !`);
        res.json(`Bonjour ${userInDb.pseudo}, votre email a déja été authentifié !`)
      } else if (!decodedToken.userId === userInDb.id && decodedToken.iss == userInDb.pseudo) {
        console.log(`une érreur est apparu =>`, err)
        res.status(401).json(`la validation de votre email a échoué`);
      } else {
        await User.emailverified(userInDb.id);
        console.log(`Le mail ${userInDb.emailAddress} à été authentifié avec succés !`);
        res.status(200).json(`Bonjour ${userInDb.pseudo}, votre mail a été authentifié avec succés ! Vous pouvez désormais fermer cette page.`)
      }
    } catch (error) {
      console.trace(
        'Erreur dans la méthode verifyEmail du userController :',
        error);
      res.status(500).json(error.message);
    }
  },
}
module.exports = userController;