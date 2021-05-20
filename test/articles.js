const Article = require('../app/models/article');
const { expect } = require('chai');


describe("Find all articles", function () {
    it("should find all articles", async function () {
        const articles = await Article.findAll();
        articles.map(article => expect(article).to.be.an.instanceOf(Article).with.property('title'));
    });
});