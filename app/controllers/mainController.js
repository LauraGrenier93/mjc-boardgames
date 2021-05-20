
/**
 * Le controller chargé de centraliser les appels a la base de données concernant l'acceuil du site
 */
const mainController = {
/**
* Méthode chargé d'aller chercher les informations relatives à la page d'acceuil
* @param {Express.Request} req - l'objet représentant la requête
* @param {Express.Response} res - l'objet représentant la réponse
*/
  init: async (req, res) => {
    try {
    
      res.redirect("http://localhost:3000/api-docs#/")
      
    } catch (error) {
      console.trace('Erreur dans la méthode init du mainController :', error);
      res.status(500).json(error);
    }
  },
};

module.exports = mainController;

















// ici un exemple de documentation de swagger pour une méthode : getCadex: (request, response) => {},
//--------------------------------------------------------------------
/* 
/**
     * Middleware chargé de générer un cadavre exquis
     * L'utilisateur peut fournir des morceaux dans la query string
     * @param {Express.Request} request - l'objet représentant la requête
     * @param {Express.Response} response - l'objet représentant la réponse
     */ 

    
    //getCadex: (request, response) => {},
//--------------------------------------------------------------------
