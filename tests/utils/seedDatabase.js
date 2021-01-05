import bcrypt from 'bcryptjs'
import prisma from '../../src/prisma'
import jwt from 'jsonwebtoken'

const userOne = {
  input: {
    name: 'dummyUser1',
    email: 'dummy1@mail.com',
    password: bcrypt.hashSync('dummypass1'),
  },
  user: undefined,
  jwt: undefined,
}

const userTwo = {
  input: {
    name: 'dummyUser2',
    email: 'dummy2@mail.com',
    password: bcrypt.hashSync('dummypass2'),
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

const commentOne = {
  input: {
    text: 'text for comment 1',
  },
  comment: undefined,
}

const commentTwo = {
  input: {
    text: 'text for comment 2',
  },
  comment: undefined,
}

const seedDatabase = async () => {
  // delete test data
  await prisma.mutation.deleteManyComments()
  await prisma.mutation.deleteManyPosts()
  await prisma.mutation.deleteManyUsers()

  // dummy user 1 for further testing
  userOne.user = await prisma.mutation.createUser({
    data: userOne.input,
  })
  userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)

  // dummy user 2 for further testing
  userTwo.user = await prisma.mutation.createUser({
    data: userTwo.input,
  })
  userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET)

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
  // create post two (draft)
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

  // create commentOne for userTwo on postOne
  commentOne.comment = await prisma.mutation.createComment({
    data: {
      ...commentOne.input,
      author: {
        connect: {
          id: userTwo.user.id,
        },
      },
      post: {
        connect: {
          id: postOne.post.id,
        },
      },
    },
  })

  // create commentTwo for userOne on postOne
  commentTwo.comment = await prisma.mutation.createComment({
    data: {
      ...commentTwo.input,
      author: {
        connect: {
          id: userOne.user.id,
        },
      },
      post: {
        connect: {
          id: postOne.post.id,
        },
      },
    },
  })
}

export {
  seedDatabase as default,
  userOne,
  userTwo,
  postOne,
  postTwo,
  commentOne,
  commentTwo,
}
