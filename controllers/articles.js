const articleRouter = require('express').Router()
const Article = require('../models/article')
require('express-async-errors')
const jwt = require('jsonwebtoken')
const { userExtractor, tokenExtractor } = require('../utils/middleware')
const User = require('../models/user')

articleRouter.get('/', async (request, response) => {
    const articles = await Article.find({}).populate('user', {
        username: 1,
        displayName: 1,
        avatarColor: 1
    })
    response.json(articles.map((x) => x.toJSON()))
})

articleRouter.get('/tags/:tag', async (req, res) => {
    const articles = await Article.find({ tags: req.params.tag })
    res.json(articles.map((x) => x.toJSON()))
})
articleRouter.get('/:id', async (request, response) => {
    const articles = await Article.findById(request.params.id).populate(
        'user',
        {
            username: 1,
            displayName: 1,
            avatarColor: 1
        }
    )
    response.json(articles)
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
        if (!body.title || !body.author) {
            return response
                .status(400)
                .send({ error: 'Error: Title and Author fields required' })
        } else {

            const article = new Article({
                author: body.author,
                title: body.title,
                url: body.url ? body.url : "--",
                description: body.description ? body.description : "N/A",
                doi: body.doi ? body.doi : "--",
                pubDate: body.pubDate ? body.pubDate : "--",
                publisher: body.publisher ? body.publisher : "--",
                user: user._id,
                tags: body.tags,
                createDate: new Date(),

            });
            try {
                const savedArticle = await article.save()
                user.articles = user.articles.concat(savedArticle._id)
                //* validateModifiedOnly:true option required on user.save() to resolve bug with mongoose-unique-validator _id check
                await user.save({
                    validateModifiedOnly: true,
                })
                return response.status(201).json(savedArticle.toJSON())
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
        modificationDate: new Date(),
        doi: body.doi,
        pubDate: body.pubDate,
        publisher: body.publisher,
        description: body.description
    }

    const returnedArticle = await Article.findByIdAndUpdate(req.params.id, updatedArticle, {
        new: true
    })
    res.json(returnedArticle.toJSON())
})

//* Handle Add Article comment
articleRouter.put('/comment/:id', tokenExtractor, userExtractor, async (req, res) => {
    const body = req.body
    const id = req.params.id
    const displayName = req.user.displayName
    const avatarColor = req.user.avatarColor
    const currentArticleEntry = await Article.findById(id)
    const currentComments = currentArticleEntry.comments
    const newCommentObject = {
        color: avatarColor,
        name: displayName,
        userId: req.user.id,
        text: body.comment,
        createDate: new Date(),
        username: req.user.username
    }
    if (body.comment === '' || body.comment === null) {
        return res.status(400).end()
    } else {
        const newComments = currentComments.concat(newCommentObject)
        const updatedComments = {
            comments: newComments
        }
        const response = await Article.findByIdAndUpdate(id, updatedComments, {
            new: true
        })
        //console.log('id:', response.id, 'response comment:', response.comment)
        res.json(updatedComments.toJSON)
    }
})

//*Handle watch article. PUT request
articleRouter.put('/:id/watch', tokenExtractor, userExtractor, async (req, res) => {
    const body = req.body
    const articleId = req.params.id
    const user = req.user
    console.log({ articleId });
    //const currentArticleEntry = await Article.findById(articleId)
    console.log('included', user.watchlist.includes(articleId.toString()));
    if (!req.token || !user) {
        return response
            .status(401)
            .send({ error: 'token missing or invalid' }).end()
    }
    if (!user.watchlist.includes(articleId)) {
        //* Add article ID to user watchlist and user ID to article Watchlist
        // Update User watchlist
        const appendedWatchlist = user.watchlist.concat(articleId)
        console.log({ appendedWatchlist });
        user.watchlist = appendedWatchlist
        const updatedUserWatchlist = await user.save({ validateModifiedOnly: true })
        //const updatedUserWatchlist = await User.findOneAndUpdate(user._id, { watchlist: appendedWatchlist }, { new: true })
        // Update Article Watchlist
        /*         const appendedArticleWatchlist = currentArticleEntry.watchlist.concat(user._id)
                const updatedArticleWatchlist = await Article.findOneAndUpdate(articleId, { watchlist: appendedArticleWatchlist }, { new: true }) */
        res.json(updatedUserWatchlist)
    } else {
        const filteredUserWatchlist = user.watchlist.filter(y => y != articleId)
        console.log({ filteredUserWatchlist });
        user.watchlist = filteredUserWatchlist
        const updatedUserWatchlist = await user.save({ validateModifiedOnly: true })
        //const updatedUserWatchlist = await User.findOneAndUpdate(user._id, { watchlist: filteredUserWatchlist }, { validateModifiedOnly: true, new: true })
        /*         const filteredArticleWatchlist = currentArticleEntry.watchlist.map(y => y === user._id ? null : y)
                console.log({ filteredArticleWatchlist });
                const updatedArticleWatchlist = await Article.findByIdAndUpdate(articleId, { watchlist: filteredArticleWatchlist }, { new: true }) */
        res.json(updatedUserWatchlist.toJSON)
    }

})
//* Get records by author

//* Get records by Tag

//* Get Records by Search Query



//* Future feature: Handle user notify ping. This feature will be implemented on separate controller notifications.js

module.exports = articleRouter
