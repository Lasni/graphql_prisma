import bcrypt from 'bcryptjs'
import prisma from '../../src/prisma'
import jwt from 'jsonwebtoken'

const userOne = {
  input: {
    name: 'dummyUser',
    email: 'dummy@mail.com',
    password: bcrypt.hashSync('dummypass1234'),
  },
  user: undefined,
  jwt: undefined,
}

const postOne = {
  input: {
    title: 'Published test post',
    body: '',
    published: true,
  },
  post: undefined,
}

const postTwo = {
  input: {
    title: 'Draft test post',
    body: '',
    published: false,
  },
  post: undefined,
}

const seedDatabase = async () => {
  // delete test data
  await prisma.mutation.deleteManyPosts()
  await prisma.mutation.deleteManyUsers()

  // dummy user for further testing
  userOne.user = await prisma.mutation.createUser({
    data: userOne.input,
  })
  userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)

  // create post one (published)
  postOne.post = await prisma.mutation.createPost({
    data: {
      ...postOne.input,
      author: {
        connect: {
          id: userOne.user.id,
        },
      },
    },
  })
  //create post two (draft)
  postTwo.post = await prisma.mutation.createPost({
    data: {
      ...postTwo.input,
      author: {
        connect: {
          id: userOne.user.id,
        },
      },
    },
  })
}

export { seedDatabase as default, userOne, postOne, postTwo }
