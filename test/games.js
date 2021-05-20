const Game = require('../app/models/game');
const { expect } = require('chai');


describe("Find all games", function () {
    it("should find all articles", async function () {
        const games = await Game.findAll();
        games.map(game => expect(game).to.be.an.instanceOf(Game).with.property('description'));
    });
});