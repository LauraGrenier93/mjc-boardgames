const Article = require('../models/article');
const { formatForArticle } = require('../services/date');
const getPreview = require('../services/preview');
/**
 * Le controller chargé de centraliser les appels a la base de données concernant les articles
 */
const articleController = {
  /**
  * Méthode chargé d'aller chercher les informations relatives à tous les articles
  * @param {Express.Response} res - l'objet représentant la réponse
  * @return {Object}  - Les articles sous forme d'objet JSON
  */
  allArticles: async (_, res) => {
    try {
      //je vais chercher tous les articles à la base de données
      const articles = await Article.findAll();
      // je boucle sur les variables articles de la base de données
      const articlesFormat = articles.map(article => {
          //je mets au bon format la date de création ou de modification de l'article si elle existe
        article.createdDate = formatForArticle(article.createdDate);
        if (article.updateDate) {
          article.updateDate = formatForArticle(article.updateDate);
        }
        //je retourne l'article
        return article;
      });
      //je crée une version courte du résumé de l'article d'une trentaine de caractères
      getPreview(articlesFormat);
      console.log(articlesFormat);
      res.json(articlesFormat);
    } catch (error) {
      console.log(error.message);
      // je renvoie une réponse 404 si la requête à échoué
      res.status(404).json(error.message);
    }
  },
  /**
  * Méthode chargé d'aller chercher les informations relatives à un article
  * @property {int} id - l'id de l'article cherché
  * @param {Express.Request} req - l'objet représentant la requête
  * @param {Express.Response} res - l'objet représentant la réponse
  * @return {Object}  - L'article sous forme d'objet JSON
  */
  oneArticle: async (req, res) => {
    try {
      const { id } = req.params;
      const article = await Article.findOne(id)
      article.createdDate = formatForArticle(article.createdDate);
      if (article.updateDate) {
        article.updateDate = formatForArticle(article.updateDate);
      }
      console.log(article);
      res.json(article);
    } catch (error) {
      console.log(error.message)
      res.status(404).json(error.message);
    }
  },
  /**
 * Une méthode qui prend en charge la création d'un nouvel article dans la BDD
 * @name newArticle
 * @property {string} title - Le titre du nouvel article
 * @property {string} description - le contenu du nouvel article
 * @property {int} authorId - l'id de l'auteur
 * @property {int} tagId - l'id du tag de l'article
 * @param {Express.Request} request - l'objet représentant la requête
 * @param {Express.Response} response - l'objet représentant la réponse
 * @return {Object}  - Le nouvel article sous forme d'objet JSON
 */
  newArticle: async (req, res) => {
    try {
      const data = req.body;
      const newArticle = new Article(data);
      await newArticle.save();
      res.json(newArticle);
    } catch (error) {
      console.log(`Erreur lors de l'enregistrement de l'article: ${error.message}`);
      res.status(500).json(error.message);
    }
  },
  /**
* Une méthode qui prend en charge la mise à jour d'un article dans la BDD
* @name updateArticle
* @property {int} id - l'id de l'article cherché
* @property {string} title - Le titre du nouvel article
* @property {string} description - le contenu du nouvel article
* @property {int} authorId - l'id de l'auteur
* @property {int} tagId - l'id du tag de l'article
* @param {Express.Request} request - l'objet représentant la requête
* @param {Express.Response} response - l'objet représentant la réponse
* @return {Object}  - L'article mis à jour sous forme d'objet JSON
*/
  updateArticle: async (req, res) => {
    try {
      const { id } = req.params;
      const article = await Article.findOne(id);

      const newData = req.body;

      if (newData.title) {
        article.title = newData.title;
      }

      if (newData.description) {
        article.description = newData.description;
      }

      if (newData.authorId) {
        article.authorId = newData.authorId;
      }

      if (newData.tagId) {
        article.tagId = newData.tagId;
      }

      await article.update();
      res.json(article);
    } catch (error) {
      console.log(`Erreur lors de la mise à jour de l'article: ${error.message}`);
      res.status(500).json(error.message);
    }
  },
  /**
  * Méthode chargé d'aller supprimer un article
  * @property {int} id - l'id de l'article cherché
  * @param {Express.Request} req - l'objet représentant la requête
  * @param {Express.Response} res - l'objet représentant la réponse
  * @return {String}  - Une string en JSON confirmant la suppression
  */
  deleteArticle: async (req, res) => {
    try {
      const { id } = req.params;
      const article = await Article.findOne(id);
      await article.delete();
      res.json(`L'article avec l'${id} a été supprimé`);
    } catch (error) {
      console.log(`Erreur lors de la supression de l'article: ${error.message}`);
      res.status(500).json(error.message);
    }
  }

};

module.exports = articleController;
