const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: String,
    url: { type: String, required: true },
    description: String,
    tags: Array,
    createDate: Date,
    modificationDate: Date,
    watchlist: Array,
    comments: Array,
    doi: String,
    pubDate: Date,
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
