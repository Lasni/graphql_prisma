// SETUP
import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import seedDatabase from './utils/seedDatabase'
import getClient from './utils/getClient'

const client = getClient()

// SETTING UP TESTING DATA
beforeEach(seedDatabase)

// TESTS
test('should create a new user', async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: { name: "Grega", email: "grega@test.com", password: "mypass1234" }
      ) {
        token
        user {
          id
        }
      }
    }
  `
  const response = await client.mutate({
    mutation: createUser,
  })
  const exists = await prisma.exists.User({
    id: response.data.createUser.user.id,
  })
  expect(exists).toBe(true)
})

test('should expose public author profiles', async () => {
  const getUsers = gql`
    query {
      users {
        id
        name
        email
      }
    }
  `
  const response = await client.query({ query: getUsers })
  expect(response.data.users.length).toBe(1) // one user
  expect(response.data.users[0].email).toBe(null) // email hidden
  expect(response.data.users[0].name).toBe('dummyUser') // name check
})

test('should not login with bad credentials', async () => {
  const login = gql`
    mutation {
      login(
        data: { email: "false@credentials.com", password: "falsecredpass123" }
      ) {
        token
      }
    }
  `
  await expect(client.mutate({ mutation: login })).rejects.toThrow()
})

test('should not sign up with a short password', async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "badUser"
          email: "badUser@email.com"
          password: "abc123"
        }
      ) {
        token
        user {
          id
        }
      }
    }
  `
  await expect(client.mutate({mutation: createUser})).rejects.toThrow()
})
