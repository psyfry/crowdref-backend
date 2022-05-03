const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, minLength: 3 },
    name: { type: String, required: true },
    passHash: String,
    articles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        }
    ]
})

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
