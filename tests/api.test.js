const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Article = require('../models/article')
const helper = require('./testHelper')
//const userHelper = require('./userHelper')
const api = supertest(app)
const User = require('../models/user')
const bcrypt = require('bcrypt')
jest.setTimeout(30000)
beforeEach(async () => {
    await Article.deleteMany({})
    await User.deleteMany({})
    const passHash = await bcrypt.hash('hunter5', 10)
    const user = new User({
        username: 'test',
        firstName: 'Test',
        lastName: 'Man',
        passHash
    })
    await user.save()
    let articleObj = helper.initialArticles.map(
        (article) => new Article(article)
    )
    const promiseArray = articleObj.map((article) => article.save())
    await Promise.all(promiseArray)
})
jest.setTimeout(30000)
describe('GET Tests', () => {
    test('GET req to /api/articles to verify correct number of posts', async () => {
        const response = await api
            .get('/api/articles')
            .set(
                'Authorization',
                'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdCIsImlkIjoiNjE3NWQyMTJhYzg4ZjE2MTEwN2IwZDFjIiwiaWF0IjoxNjM1MTExNTMwLCJleHAiOjE2Mzg3MTE1MzB9.BLVhRYEsnMwJeqbDFFkJMooC-nYGe4-CXbbeqHgVE_A'
            )
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(response.body).toHaveLength(2)
        //console.log(response.statusCode, response.body)
        //console.log('token', response.token)
    })

    test('articles contain _id property', async () => {
        const response = await api
            .get('/api/articles')
            .set(
                'Authorization',
                'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdCIsImlkIjoiNjE3NWQyMTJhYzg4ZjE2MTEwN2IwZDFjIiwiaWF0IjoxNjM1MTExNTMwLCJleHAiOjE2Mzg3MTE1MzB9.BLVhRYEsnMwJeqbDFFkJMooC-nYGe4-CXbbeqHgVE_A'
            )
            .send()
            .expect(200)
        const idTest = response.body.map((x) => x._id)
        expect(idTest).toBeDefined()
    })
})
describe('POST Tests', () => {
    test('POST creates new article entry, verifies total entries inc +1, and contains correct title', async () => {
        const newArticle = {
            title: 'POST TEST NEW ENTRY',
            author: 'TEST',
            url: 'https://POSTTEST.com/',
            description: 'Test Article 2',
            tags: [],
            doi: '55.55.test.doi.org',
            pubDate: '12-12-2000',
            publisher: 'Test Publisher 2'
        }
        const login = await api
            .post('/api/login')
            .send({ username: 'test', password: 'hunter5' })
            .expect(200)
        const token = login.body.token
        //console.log('login.token', token)
        await api
            .post('/api/articles')
            .auth(token, { type: 'bearer' })
            .send(newArticle)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get('/api/articles')
            .set('Authorization', 'bearer ' + token)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        await expect(response.body).toHaveLength(
            helper.initialArticles.length + 1
        )
        const contentTest = response.body.map((x) => x.title)
        expect(contentTest[ 2 ].toString()).toContain('POST TEST NEW ENTRY')
    })

    test('new article entry POST fails with status 401 if token is absent', async () => {
        const newArticle = {
            title: 'POST TEST NEW ENTRY',
            author: 'TEST',
            url: 'https://POSTTEST.com/',
            description: 'Test Article 2',
            tags: [],
            watchlist: [],
            comments: [],
            doi: '55.55.test.doi.org',
            pubDate: '12-12-2000',
            publisher: 'Test Publisher 2'
        }
        await api
            .post('/api/login')
            .send({ username: 'test', password: 'hunter5' })
            .expect(200)
        const token = '11111111111111111111111111111'
        await api
            .post('/api/articles')
            .set('Authorization', 'bearer ' + token)
            .send(newArticle)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get('/api/articles')
            .set('Authorization', 'bearer ' + token)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        await expect(response.body).toHaveLength(helper.initialArticles.length)
    })

    test(' if the title or author property is missing from the request, it will return 400 Bad Request', async () => {
        const testArticles = [
            {
                author: 'TEST',
                url: 'https://POSTTEST.com/'
            },
            {
                title: 'POST TEST NEW ENTRY',
                url: 'https://POSTTEST.com/'
            }
        ]
        const login = await api
            .post('/api/login')
            .send({ username: 'test', password: 'hunter5' })
            .expect(200)
        const token = login.body.token
        await api
            .post('/api/articles')
            .set('Authorization', 'bearer ' + token)
            .send(testArticles[ 0 ])
            .expect(400)
        await api
            .post('/api/articles')
            .set('Authorization', 'bearer ' + token)
            .send(testArticles[ 1 ])
            .expect(400)
    })
})

describe('DELETE method Tests', () => {
    test('A entry is deleted when a delete method is recieved at the corresponding URL ', async () => {
        const startingArticles = await helper.articlesInDb()
        const entryToDelete = startingArticles[ 0 ]
        const login = await api
            .post('/api/login')
            .send({ username: 'test', password: 'hunter5' })
            .expect(200)
        const token = login.body.token
        await api
            .delete(`/api/articles/${entryToDelete.id}`)
            .set('Authorization', 'bearer ' + token)
            .expect(204)
        const endArticles = await helper.articlesInDb()
        expect(endArticles).toHaveLength(startingArticles.length - 1)
        const outputContent = endArticles.map((x) => x.title)
        expect(outputContent).not.toContain(entryToDelete.title)
    })
})
describe('PUT Entry Update tests', () => {
    test('PUT request updates the corresponding article entry', async () => {
        const startingArticle = await helper.articlesInDb()
        const updatedArticle = startingArticle[ 0 ]
        const login = await api
            .post('/api/login')
            .send({ username: 'test', password: 'hunter5' })
            .expect(200)
        const token = login.body.token
        await api
            .put(`/api/articles/${updatedArticle.id}`)
            .set('Authorization', 'bearer ' + token)
            .send({
                title: 'PUT TEST Editted ENTRY',
                author: 'TEST',
                url: 'https://PUTTEST.com/',
                description: 'Test Article 2',
                tags: [ 'test tag' ],
                watchlist: [],
                comments: [],
                doi: '55.55.test.doi.org',
                pubDate: '12-12-2000',
                publisher: 'Test Publisher 2'
            })
            .expect(200)
        const endingArticles = await helper.articlesInDb()
        expect(endingArticles).toHaveLength(helper.initialArticles.length)
        expect(endingArticles[ 0 ].title).toContain('PUT TEST Editted ENTRY')
    })
})
describe('Comment Tests', () => {
    test('PUT to /api/:id/comment adds the comment to the users MongoDB comments array ', async () => {
        const startingArticle = await helper.articlesInDb()
        const updatedArticle = startingArticle[ 0 ]
        const login = await api
            .post('/api/login')
            .send({ username: 'test', password: 'hunter5' })
            .expect(200)

        const token = login.body.token
        await api
            .put(`/api/articles/comment/${updatedArticle.id}/`)
            .set('Authorization', 'Bearer ' + token)
            .send({ comment: 'test comment' })
            .expect(200)
        await api
            .put(`/api/articles/comment/${updatedArticle.id}/`)
            .set('Authorization', 'Bearer ' + token)
            .send({ comment: 'test comment' })
            .expect(200)
        const endingArticles = await helper.articlesInDb()
        expect(endingArticles).toHaveLength(helper.initialArticles.length)
        const contentTest = endingArticles.map((x) => x.comments)
        const articleComments = contentTest[ 0 ].map(x => x.text)
        expect(articleComments).toEqual([ 'test comment', 'test comment' ])
    })
})

describe('Watchlist Tests', () => {
    test('When user "test", sends watch request to unwatched article at api/:id/watch , the article is added to their user watchlist field', async () => {
        const startingArticle = await helper.articlesInDb()
        const watchedArticle = startingArticle[ 0 ]
        const login = await api
            .post('/api/login')
            .send({ username: 'test', password: 'hunter5' })
            .expect(200)

        const token = login.body.token

        await api
            .put(`/api/articles/${watchedArticle.id}/watch`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
        const userResult = await User.findOne({ username: 'test' })
        expect(userResult.watchlist).toHaveLength(1)

    })
    test('When user "test", sends watch request to a currently watched article at api/:id/watch , the article is removed from their watchlist field', async () => {
        const startingArticle = await helper.articlesInDb()
        const watchedArticle = startingArticle[ 0 ]
        const login = await api
            .post('/api/login')
            .send({ username: 'test', password: 'hunter5' })
            .expect(200)

        const token = login.body.token

        await api
            .put(`/api/articles/${watchedArticle.id}/watch`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
        await api
            .put(`/api/articles/${watchedArticle.id}/watch`)
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
        const userResult = await User.findOne({ username: 'test' })
        expect(userResult.watchlist).toHaveLength(0)
    })
})
/* test('When user "test", sends watch request to unwatched article at api/:id/watch , their user ID is added to the article watchlist field', async () => {
    const startingArticle = await helper.articlesInDb()
    const watchedArticle = startingArticle[ 0 ]
    const login = await api
        .post('/api/login')
        .send({ username: 'test', password: 'hunter5' })
        .expect(200)

    const token = login.body.token

    await api
        .put(`/api/articles/${watchedArticle.id}/watch`)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
    const endingArticles = await helper.articlesInDb()
    expect(endingArticles[ 0 ].watchlist).toHaveLength(1)
    expect(endingArticles[ 0 ].watchlist).toContain(watchedArticle.id)
})
test('When user "test", sends unwatch request to a currently watched article at api/:id/watch , their user ID is removed from the article watchlist field', async () => {
    const startingArticle = await helper.articlesInDb()
    const watchedArticle = startingArticle[ 0 ]
    const login = await api
        .post('/api/login')
        .send({ username: 'test', password: 'hunter5' })
        .expect(200)

    const token = login.body.token

    await api
        .put(`/api/articles/${watchedArticle.id}/watch`)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
    await api
        .put(`/api/articles/${watchedArticle.id}/watch`)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
    const endingArticles = await helper.articlesInDb()
    expect(endingArticles[ 0 ].watchlist).toHaveLength(0)
}) */


//* Future feature
/* describe('TAGGING TESTS', () => {
    test('in use tags should be aggregatted', () => { second })
 })*/
afterAll(() => mongoose.connection.close())
