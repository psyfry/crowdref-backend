const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Article = require('../models/article')
const helper = require('./testHelper')
const api = supertest(app)

beforeEach(async () => {
    await Article.deleteMany({})
    let articleObj = helper.initialArticles.map(
        (article) => new Article(article)
    )
    const promiseArray = articleObj.map((article) => article.save())
    await Promise.all(promiseArray)
})

afterAll(() => mongoose.connection.close())
