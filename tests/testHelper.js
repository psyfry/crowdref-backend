const Article = require('../models/article')

const initialArticles = [
    {
        title: 'Test',
        author: 'Test Author',
        url: 'testurl.test',
        description: 'Test Article 1',
        tags: [],
        watchlist: [],
        comments: [],
        doi: '3.5.test.doi.org',
        pubDate: '5-10-2000',
        publisher: 'Test Publisher'
    }
]
const articlesInDb = async () => {
    const articles = await Article.find({})
    return articles.map((x) => x.toJSON())
}

const nonExistingIdTest = async () => {
    const article = new Article({
        title: 'deletedEntryTest',
        author: 'deleted'
    })
    await article.save()
    await article.remove()

    return article._id.toString()
}
module.exports = {
    articlesInDb,
    nonExistingIdTest,
    initialArticles
}
