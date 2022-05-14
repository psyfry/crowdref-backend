const articleRouter = require('express').Router()
const Article = require('../models/article')
require('express-async-errors')
const jwt = require('jsonwebtoken')
const { userExtractor, tokenExtractor } = require('../utils/middleware')

articleRouter.get('/', async (request, response) => {
    const articles = await Article.find({}).populate('user', {
        username: 1,
        name: 1
    })
    response.json(articles.map((x) => x.toJSON()))
})

articleRouter.get('/:id', async (request, response) => {
    const articles = await Article.findById(request.params.id).populate(
        'user',
        {
            username: 1,
            name: 1
        }
    )
    response.json(articles.toJSON())
})

articleRouter.post(
    '/',
    tokenExtractor,
    userExtractor,
    async (request, response, next) => {
        const body = request.body
        const user = request.user

        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!request.token || !decodedToken.id) {
            return response
                .status(401)
                .send({ error: 'token missing or invalid' })
        }
        if (!body.title || !body.url) {
            return response
                .status(400)
                .send({ error: 'Title and URL fields required' })
        } else {
            const article = new Article({
                author: body.author,
                title: body.title,
                url: body.url,
                description: body.description,
                doi: body.doi,
                pubDate: body.pubDate,
                publisher: body.publisher,
                user: user._id,
                tags: body.tags
            })
            try {
                const savedArticle = await article.save()
                user.articles = user.articles.concat(savedArticle._id)
                await user.save()
                response.status(201).json(savedArticle.toJSON)
            } catch (exception) {
                next(exception)
            }
        }
    }
)
//* Handle delete record
articleRouter.delete(
    '/:id',
    tokenExtractor,
    userExtractor,
    async (request, response) => {
        const user = request.user
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!request.token || !decodedToken.id) {
            return response
                .status(401)
                .send({ error: 'token missing or invalid' })
        }
        if (user.id === decodedToken.id) {
            await Article.findByIdAndRemove(request.params.id)
            response.status(204).end()
        } else {
            return response
                .status(401)
                .send({ error: 'Unauthorized to delete this entry' })
        }
    }
)
//*Handle changes to record details
articleRouter.put('/:id', tokenExtractor, userExtractor, async (req, res) => {
    const body = req.body
    const updatedArticle = {
        author: body.author,
        title: body.title,
        url: body.url,
        tags: body.tags,
        modificationDate: Date.now(),
        doi: body.doi,
        pubDate: body.pubDate,
        publisher: body.publisher,
        description: body.description
    }

    await Article.findByIdAndUpdate(req.params.id, updatedArticle, {
        new: true
    })
    res.json(updatedArticle.toJSON)
})

//* Handle article comments
articleRouter.put('/comment/:id', async (req, res) => {
    const body = req.body
    const id = req.params.id
    const currentArticleEntry = await Article.findById(id)
    const currentComments = currentArticleEntry.comments

    if (body.comments === '' || body.comments === null) {
        return res.status(400).end()
    } else {
        const newComment = currentComments.concat(body.comments)
        const updatedComments = {
            author: currentArticleEntry.author,
            title: currentArticleEntry.title,
            url: currentArticleEntry.url,
            comments: newComment
        }
        const response = await Article.findByIdAndUpdate(id, updatedComments, {
            new: true
        })
        console.log('id:', response.id, 'response comment:', response.comment)
        res.json(updatedComments.toJSON)
    }
})

//*Handle watch article. PUT request with no body necessary
articleRouter.put('/:id/watch', tokenExtractor, userExtractor, async (req, res) => {
    const body = req.body
    const id = req.params.id
    const currentArticleEntry = await Article.findById(id)
    //* userExtractor to get username. I think this is accessed by req.username
    const appendedWatchlist = req.user.watchlist.concat(id)
    // Update User watchlist
    const updatedUserWatchlist = await User.findByIdAndUpdate()
    // Update Article Watchlist
    //const response = await 
})


//* Get records by author

//* Get records by Tag

//* Future feature: Handle user notify ping. This feature will be implemented on separate controller notifications.js

module.exports = articleRouter
