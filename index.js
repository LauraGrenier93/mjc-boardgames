// je requière les info de connexion qui sont dans un point env précis en passant en argument la localisation du .env.back 
require('dotenv').config({ path: `${__dirname}/.env.back` });
//je requière les modules nécéssaire : 
const cors = require('cors');
//const corsMW = require('./app/middlewares/corsMW');
const log = require('./app/middlewares/log');
const expressSanitizer = require('express-sanitizer');
const session = require('express-session');
const express = require('express');
const router = require('./app/router');
//je crée mon router
const app = express();
//j'utilise la variable d'environnement PORT pour attribuer un port à notre appli express ou port par défault
const port = process.env.PORT || 5000;
// Mise en place de swagger pour plus tard quand on voudra documenter notre API =>
// https://www.npmjs.com/package/express-swagger-generator 
const expressSwagger = require('express-swagger-generator')(app);
let options = require('./swagger-config.json');
options.basedir = __dirname; // __dirname désigne le dossier du point d'entrée
options.swaggerDefinition.host = `localhost:${port}`;
expressSwagger(options);
//Nos Middlewares :
// module de log d'identification : me donne l'ip, l'heure et l'url de chaque connexion  
app.use(log);
// le parser JSON qui récupère le payload quand il y en a un et le transforme en objet JS disponible sous request.body
app.use(express.json()); 
// on va devoir gérer des données en POST, on ajoute le middleware urlencoded pour récupérer les infos dans request.body 
app.use(express.urlencoded({extended: true})); 
//Une ptite sécurité supplémentaire avec ce module qui filtre, comme Joi, nos entrés, en enlevant tout tag html et balise
app.use(expressSanitizer()); 
// mise en place du système de sessions pour stocker les infos utilisateur
app.use(
session({
resave:true,
saveUninitialized: true,
secret: process.env.SECRET,
cookie: {
  secure:false,
  maxAge: 1000*60*60*5,
}}))
// Je require le middleware pour dire à express d'être plus permissif sur l'origine des requête
app.use(cors({ 
  optionsSuccessStatus: 200,//pour transmettre un statue 200 pour d'ancien navigateur
  credentials: true, //permet de transmettre un en-tête
  origin:  'https://LesGardiensOfLegende.surge.sh', // true rend accessible l'api par sécurité il faut mettre notre adresse du front
  methods: "GET, PUT, PATCH, POST, DELETE", //configure l'en-têtes pour les méthodes des routes
  allowedHeaders : ['Content-Type', 'Authorization'], // configure l'en-tête pour recevoir un tableau
})); 
// on préfixe notre router avec un V1 qui sera inclus devant chaque nom de route. Permet de faire évoluer l'app avec une V2
app.use('/v1', router);
app.listen(port, () => {
  console.log(`API Back jeux de société Running on http://localhost:${port}`);
});
