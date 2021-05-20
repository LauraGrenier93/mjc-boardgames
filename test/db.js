const { Client } = require('pg');

const db = new Client();

// IIFE : Instantly Invoked Function Expression
(async () => {
    await db.connect();

    await db.end();

    await db.connect();
})();