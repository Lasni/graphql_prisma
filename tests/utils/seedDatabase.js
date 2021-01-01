import bcrypt from 'bcryptjs'
import prisma from '../../src/prisma'

const seedDatabase = async () => {
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
}

export { seedDatabase as default }
