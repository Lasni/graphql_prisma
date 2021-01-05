import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, {
  userOne,
  commentOne,
  commentTwo,
  postOne,
} from './utils/seedDatabase'
import getClient from './utils/getClient'
import { deleteComment, subscribeToComments } from './utils/operations'

const client = getClient()

// SETTING UP TESTING DATA
beforeEach(seedDatabase)

// TESTS
test('should delete own comment', async () => {
  const client = getClient(userOne.jwt)
  const variables = {
    id: commentTwo.comment.id,
  }
  const response = await client.mutate({ mutation: deleteComment, variables })
  expect(response.data.deleteComment.id).toBe(commentTwo.comment.id)
  const exists = await prisma.exists.Comment({ id: commentTwo.comment.id })
  expect(exists).toBe(false)
})

test('should not delete other users comment', async () => {
  const client = getClient(userOne.jwt)
  const variables = {
    id: commentOne.comment.id,
  }
  await expect(
    client.mutate({ mutation: deleteComment, variables }),
  ).rejects.toThrow()
})

// subscription testing
test('should subscribe to comments on a post', async (done) => {
  const variables = {
    postId: postOne.post.id,
  }
  client.subscribe({ query: subscribeToComments, variables }).subscribe({
    next(response) {
      expect(response.data.comment.mutation).toBe('DELETED')
      done()
    },
  })
  // change a comment
  await prisma.mutation.deleteComment({ where: { id: commentOne.comment.id } })
})
