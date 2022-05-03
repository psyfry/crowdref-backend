const testing = require('express').Router()
const Article = require('../models/article')
const User = require('../models/user')

testing.post('/reset', async (request, response) => {
    await Article.deleteMany({})
    await User.deleteMany({})

    response.status(204).end()
})

module.exports = testing
