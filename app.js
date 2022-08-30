require('dotenv')
const config = require('./utils/config')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('express-async-errors')
const logger = require('./utils/logger')
const articleRouter = require('./controllers/articles')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const watchlistRouter = require('./controllers/watchlist')
//const responseTime = require('response-time')
mongoose
    .connect(config.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        logger.info('Connection to MongoDB successful')
    })
    .catch((error) => {
        logger.error('Error: Unable to connect to MongoDB', error.message)
    })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLog)
app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/articles', articleRouter)
app.use('/api/watchlist', watchlistRouter)
if (process.env.NODE_ENV === 'test') {
    const testing = require('./controllers/testingRouter')
    app.use('/api/testing/', testing)
}
/* app.use(responseTime((req, res, time) => {
    logger.info(time)
})) */
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
