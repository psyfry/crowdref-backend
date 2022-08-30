const { tokenExtractor, userExtractor } = require('../utils/middleware')
const watchlistRouter = require('express').Router()
const User = require('../models/user')

watchlistRouter.get('/', tokenExtractor, userExtractor, async (req, res) => {
    const user = req.user
    console.log({ user })
    const populatedWatchlist = await User.findById(user._id).populate('watchlist')
    //const populatedWatchlist = await user.populate('watchlist')
    console.log({ populatedWatchlist })
    res.send(populatedWatchlist.watchlist.map(x => x.toJSON()))
    //res.send(populatedWatchlist.watchlist.map(x => x.toJSON())) : res.status(404).end()
})
module.exports = watchlistRouter