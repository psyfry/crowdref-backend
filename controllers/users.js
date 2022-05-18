const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const profileHelper = require('../utils/profileHelper')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('articles')

    response.json(users.map((x) => x.toJSON()))
})

usersRouter.get('/:id', async (request, response) => {
    const user = await User.findById(request.params.id)

    user ? response.json(user.toJSON()) : response.status(404).end()
})

usersRouter.post('/', async (request, response) => {
    const body = request.body
    const saltRounds = 10
    const avatarColor = profileHelper.getAvatarColor()
    const passHash = await bcrypt.hash(body.password, saltRounds)
    if (body.password.length < 7) {
        response
            .status(400)
            .json({ error: 'Password must be at least 7 characters' }).end()
    } else if (body.username.length < 3) {
        response
            .status(400)
            .json({ error: 'Username must be at least 3 characters' }).end()
    } else if (body.firstName.length < 1) {
        response
            .status(400)
            .json({ error: 'Missing First Name' }).end()
    } else if (body.lastName.length < 1) {
        response
            .status(400)
            .json({ error: 'Missing Last Name' }).end()
    }

    const formatFirst = profileHelper.formatName(body.firstName)
    const formatLast = profileHelper.formatName(body.lastName)
    const avatarInitials = profileHelper.getDisplayName(formatFirst, formatLast)
    const user = new User({
        username: body.username,
        firstName: formatFirst,
        lastName: formatLast,
        articles: [],
        watchlist: [],
        notifications: [ { sender: 'System', message: 'Welcome to CrowdRef' } ],
        displayName: avatarInitials,
        avatarColor: avatarColor,
        passHash
    })
    const saveUser = await user.save()
    response.json(saveUser.toJSON())
})

module.exports = usersRouter
