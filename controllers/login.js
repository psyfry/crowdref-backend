const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (req, res) => {
    const body = req.body
    const user = await User.findOne({ username: body.username })
    const passwordCorrect =
        user === null
            ? false
            : await bcrypt.compare(body.password, user.passHash)
    if (!(user && passwordCorrect)) {
        return res.status(401).send({ error: 'invalid credentials' })
    }
    const userToken = {
        user: user.username,
        id: user._id
    }
    //Token expires in 100 hours for testing purposes
    const token = jwt.sign(userToken, process.env.SECRET, {
        expiresIn: 6000 * 600
    })

    res.status(200).send({ token, username: user.username, displayName: user.displayName, avatarColor: user.avatarColor, firstName: user.firstName })
})

module.exports = loginRouter
