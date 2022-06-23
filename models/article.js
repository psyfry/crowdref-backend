const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    url: String,
    description: String,
    tags: Array,
    createDate: Date,
    modificationDate: Date,
    watchlist: Array,
    comments: Array,
    doi: String,
    pubDate: String,
    publisher: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})
articleSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Article = mongoose.model('Article', articleSchema)
module.exports = Article
