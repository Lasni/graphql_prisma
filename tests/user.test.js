// SETUP
import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import seedDatabase, { userOne } from './utils/seedDatabase'
import getClient from './utils/getClient'
import { createUser, getUsers, getProfile, login } from './utils/operations'

const client = getClient()

// SETTING UP TESTING DATA
beforeEach(seedDatabase)

// TESTS
test('should create a new user', async () => {
  const variables = {
    data: {
      name: 'Grega',
      email: 'grega@test.com',
      password: 'mypass1234',
    },
  }
  const response = await client.mutate({
    mutation: createUser,
    variables,
  })
  const exists = await prisma.exists.User({
    id: response.data.createUser.user.id,
  })
  expect(exists).toBe(true)
})

test('should expose public author profiles', async () => {
  const response = await client.query({ query: getUsers })
  expect(response.data.users.length).toBe(2) // two users
  expect(response.data.users[0].email).toBe(null) // email hidden
  expect(response.data.users[0].name).toBe('dummyUser1') // name check
  expect(response.data.users[1].name).toBe('dummyUser2') // name check
})

test('should not login with bad credentials', async () => {
  const variables = {
    data: { email: 'false@credentials.com', password: 'falsecredpass123' },
  }
  await expect(client.mutate({ mutation: login, variables })).rejects.toThrow()
})

test('should not sign up with a short password', async () => {
  const variables = {
    data: {
      name: 'badUser',
      email: 'badUser@email.com',
      password: 'abc123',
    },
  }
  await expect(
    client.mutate({ mutation: createUser, variables }),
  ).rejects.toThrow()
})

test('should fetch user profile', async () => {
  const client = getClient(userOne.jwt)
  const response = await client.query({ query: getProfile })
  expect(response.data.me.id).toBe(userOne.user.id)
  expect(response.data.me.name).toBe(userOne.user.name)
  expect(response.data.me.email).toBe(userOne.user.email)
})
