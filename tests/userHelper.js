const User = require('../models/user')
/* const initialUsers = [
    {
        username: 'testMan',
        name: 'Test Man',
        password: 'hunter5',
    },
] */

const usersInDb = async () => {
    const users = await User.find({})
    console.log(users)
    return users.map((x) => x.toJSON())
}

const nonExistingIdTest = async () => {
    const user = new User({
        username: 'badUserNoId',
        userId: 999999999999,
        name: 'Nonexistant UserId'
    })
    await user.save()
    await user.remove()

    return user._id.toString()
}
module.exports = {
    usersInDb,
    nonExistingIdTest
}
