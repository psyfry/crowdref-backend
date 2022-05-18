const User = require('../models/user')

const jwt = require('jsonwebtoken')
const logger = require('./logger')

const requestLog = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:', request.path)
    logger.info('Body', request.body)
    logger.info('----------------------')
    next()
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('Authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.substring(7)
    } else {
        return null
    }
    next()
}

const userExtractor = async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findOne({ _id: decodedToken.id })
    if (user) {
        request.user = user
    } else {
        response.status(404).send({ error: 'Username not found from Token' })
        return null
    }
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if (error === 'CastError') {
        return response.status(400).send({ error: 'Malformed resource ID' })
    } else if (error === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
        return response.status(400).json({
            success: false,
            error: 'Username taken. Please select a different username'
        })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).send({ error: 'invalid token' })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).send({
            error: 'token expired'
        })
    }

    logger.error(error.message)
    next(error)
}

module.exports = {
    requestLog,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}
