require('dotenv')
const config = require('./utils/config')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('express-async-errors')
const logger = require('./utils/logger')

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
app.use(express.json())

module.exports = app
