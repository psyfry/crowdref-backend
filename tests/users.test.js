const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./userHelper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const bcrypt = require('bcrypt')
jest.setTimeout(30000)
describe('User Tests initialized with one user "test"', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const passHash = await bcrypt.hash('hunter5', 10)
        const user = new User({
            username: 'test',
            firstName: 'Test',
            lastName: 'Man',
            passHash
        })
        await user.save()
        console.log('initial conditions complete')
    })
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
                firstName: 'Psy',
                lastName: 'Fry',
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
        })

        test('Password less than 7 characters fails with 400 status', async () => {
            const newUser = {
                username: 'badPass',
                firstName: 'Short',
                lastName: 'Pass',
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
                'Password must be at least 7 characters'
            )
        })
        test('Username less than 3 characters fails with 400 status', async () => {
            const newUser = {
                username: 'b',
                firstName: 'Short',
                lastName: 'username',
                password: '12345678'
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
        })
        test('No First Name should fail with 400 status', async () => {
            const newUser = {
                username: 'noFirst',
                firstName: '',
                lastName: 'NoFirst',
                password: '12345678'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            //const finalUsers = await helper.usersInDb()
            //expect(finalUsers).toHaveLength(helper.initialUsers.length)
            expect(result.body.error).toContain('Missing First Name')
        })
        test('No Last Name should fail with 400 status', async () => {
            const newUser = {
                username: 'noLast',
                firstName: 'noLast',
                lastName: '',
                password: '12345678'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            //const finalUsers = await helper.usersInDb()
            //expect(finalUsers).toHaveLength(helper.initialUsers.length)
            expect(result.body.error).toContain('Missing Last Name')
        })
        test('Created User should have displayName field containing first and last initials', async () => {
            const newUser = {
                username: 'testUser',
                firstName: 'Test',
                lastName: 'user',
                password: '12345678'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-Type', /application\/json/)
            //const finalUsers = await helper.usersInDb()
            //expect(finalUsers).toHaveLength(helper.initialUsers.length)
            expect(result.body.displayName).toContain('TU')
        })
        test('Created User should have defined avatarColor field', async () => {
            const newUser = {
                username: 'testUser',
                firstName: 'Test',
                lastName: 'User',
                password: '12345678'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-Type', /application\/json/)
            //const finalUsers = await helper.usersInDb()
            //expect(finalUsers).toHaveLength(helper.initialUsers.length)
            console.log("avatarColor: ", result.body.avatarColor);
            expect(result.body.avatarColor).toBeDefined()
        })
        test('Non-unique username fails with 400 status code response', async () => {
            const newUser = {
                username: 'test',
                firstName: 'Test',
                lastName: 'Man',
                password: '12345678'
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            //const finalUsers = await helper.usersInDb()
            //console.log('result.body', result.body)
            //console.log('error body', result.body.error)
            expect(result.body.error).toContain('Username taken. Please select a different username')
            //expect(finalUsers).toHaveLength(startingUsers.length)
        })
    })
})
afterAll(() => mongoose.connection.close())
