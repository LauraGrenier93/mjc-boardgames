const express = require('express');

const log = express();

/**
 * Un middleware qui donne en console l'adresse ip, la date et l'url demandé par cette même adresse ip.
 * 
 */
log.use((req, res, next) => {
 
  const now = new Date(); // l'instant exact de la requête

  // le fameux message de journal
  console.log(`Date de la connexion : ${now.toISOString()} /// Adresse ip de la connexion : ${req.ip} /// URL demandée : ${req.url}`);

  // systématiquement et inconditionnellement
  next();
})
module.exports = log;
