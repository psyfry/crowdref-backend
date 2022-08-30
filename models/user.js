const mongoose = require('mongoose')
//const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, minLength: 3, unique: true, uniqueCaseInsensitive: true },
    firstName: {
        type: String, minLength: 1
    },
    lastName: { type: String, minLength: 1 },
    avatarColor: String,
    displayName: String,
    passHash: String,
    articles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        }
    ],
    watchlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        }
    ],
    notifications: Array
})
/* userSchema.plugin(uniqueValidator, { message: 'Username taken. Please select a different username' }) */
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User
