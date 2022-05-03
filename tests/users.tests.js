const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./userHelper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
//const uniqueUser = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')

describe('User Tests initialized with one user "test"', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const passHash = await bcrypt.hash('hunter5', 10)
        const user = new User({
            username: 'test',
            name: 'Test Man',
            passHash
        })
        await user.save()
        console.log('initial conditions complete')
    }, 10000)

    describe('GET User list', () => {
        test('GET single initial user', async () => {
            const fetchedUsers = await api
                .get('/api/users')
                .expect(200)
                .expect('Content-Type', /application\/json/)
            expect(fetchedUsers.body).toHaveLength(1)
        })
    })
    describe('User Creation Tests', () => {
        test('Adding a new username creates new entry for total of two users', async () => {
            const startingUsers = await helper.usersInDb()
            const newUser = {
                username: 'Psyfry',
                name: 'Psy Fry',
                password: 'testPass'
            }
            await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const finalUsers = await helper.usersInDb()
            const usernameList = finalUsers.map((x) => x.username)
            expect(usernameList).toHaveLength(startingUsers.length + 1)
            expect(usernameList).toContain(newUser.username)
        }, 10000)

        test('Password less than 3 characters fails with 400 status', async () => {
            const newUser = {
                username: 'badPass',
                name: 'Short Pass',
                password: '1'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            //const finalUsers = await helper.usersInDb()
            //expect(finalUsers).toHaveLength(helper.initialUsers.length)
            expect(result.body.error).toContain(
                'Password must be at least 3 characters'
            )
        }, 10000)
        test('Username less than 3 characters fails with 400 status', async () => {
            const newUser = {
                username: 'b',
                name: 'Short username',
                password: '123456'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            //const finalUsers = await helper.usersInDb()
            //expect(finalUsers).toHaveLength(helper.initialUsers.length)
            expect(result.body.error).toContain(
                'Username must be at least 3 characters'
            )
        }, 10000)
        test('Non-unique username fails with 400 status code response', async () => {
            //Test currently fails due to 500 error, however postman test under same conditions produces expected result of 400 with validationError. Check express-unique-validator version bugs.
            //const startingUsers = await helper.usersInDb()
            const newUser = {
                username: 'test',
                name: 'Doppelganger testman',
                password: '12345'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            //const finalUsers = await helper.usersInDb()
            console.log('result.body', result.body)
            console.log('error body', result.body.error)
            expect(result.body.message).toContain('Username taken')
            //expect(finalUsers).toHaveLength(startingUsers.length)
        })
    })
})
afterAll(() => mongoose.connection.close())
