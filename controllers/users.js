const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

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
    const passHash = await bcrypt.hash(body.password, saltRounds)
    const user = new User({
        username: body.username,
        name: body.name,
        articles: [],
        passHash
    })

    if (body.password.length < 3) {
        response
            .status(400)
            .json({ error: 'Password must be at least 3 characters' })
    } else if (body.username.length < 3) {
        response
            .status(400)
            .json({ error: 'Username must be at least 3 characters' })
    }

    const saveUser = await user.save()
    response.json(saveUser.toJSON())
})

module.exports = usersRouter
