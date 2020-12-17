import { Prisma } from 'prisma-binding'

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466',
  secret: '',
})

const createPostForUser = async (authorID, data) => {
  const userExists = await prisma.exists.User({
    id: authorID,
  })
  if (!userExists) {
    throw new Error('User does not exist')
  }
  const post = await prisma.mutation.createPost(
    {
      data: {
        ...data,
        author: {
          connect: {
            id: authorID,
          },
        },
      },
    },
    '{ id author { id name email posts { id title published } } }',
  )
  return post.author
}
// createPostForUser('ckirfj0c8007y0872rixf7ml7', {
//   title: 'Great books to read 3',
//   body: 'Swans: Oral History3',
//   published: true,
// })
//   .then((user) => console.log(JSON.stringify(user, undefined, 2)))
//   .catch((err) => console.log(err.message))

const updatePostForUser = async (postID, data) => {
  const postExists = await prisma.exists.Post({
    id: postID,
  })
  if (!postExists) {
    throw new Error('Post does not exist')
  }
  const post = await prisma.mutation.updatePost(
    {
      data: {
        ...data,
      },
      where: {
        id: postID,
      },
    },
    '{ author { id name email posts { id title published } } }',
  )
  return post.author
}
// updatePostForUser('ckirfu5ok00br0872eemqshyg', {
//   published: false,
// })
//   .then((user) => console.log(JSON.stringify(user, null, 2)))
//   .catch((err) => console.log(err.message))

// prisma.exists
//   .Comment({
//     id: 'ckirgk04h00ne087223yumdr3',
//   })
//   .then((exists) => console.log(exists))
