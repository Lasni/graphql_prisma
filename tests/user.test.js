// SETUP
import 'cross-fetch/polyfill'
import ApolloBoost, { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import bcrypt from 'bcryptjs'

const client = new ApolloBoost({
  uri: 'http://localhost:4000',
})

// SETTING UP TESTING DATA
beforeEach(async () => {
  await prisma.mutation.deleteManyPosts()
  await prisma.mutation.deleteManyUsers()
  
  // dummy user for further testing
  const dummyUser = await prisma.mutation.createUser({
    data: {
      name: 'dummyUser',
      email: 'dummy@mail.com',
      password: bcrypt.hashSync('dummypass1234'),
    },
  })
  // create first post (published)
  await prisma.mutation.createPost({
    data: {
      title: 'Published test post',
      body: '',
      published: true,
      author: {
        connect: {
          id: dummyUser.id,
        },
      },
    },
  })
  //create second post (draft)
  await prisma.mutation.createPost({
    data: {
      title: 'Draft test post',
      body: '',
      published: false,
      author: {
        connect: {
          id: dummyUser.id,
        },
      },
    },
  })
})

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
