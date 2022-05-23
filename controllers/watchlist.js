const { userExtractor, tokenExtractor } = require('../utils/middleware')
const watchlistRouter = require('express').Router()
const User = require('../models/user')

watchlistRouter.get('/', tokenExtractor, userExtractor, async (req, res) => {
    const user = req.user
    console.log(user);

    const populatedWatchlist = await User.findById(req.user._id).populate('watchlist')
    console.log({ populatedWatchlist });
    user ? res.send(populatedWatchlist.watchlist.map(x => x.toJSON())) : res.status(404).end()
})
module.exports = watchlistRouter