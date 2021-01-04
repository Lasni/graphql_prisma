import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import seedDatabase, { userOne, postOne, postTwo } from './utils/seedDatabase'
import getClient from './utils/getClient'
import {
  getPosts,
  myPosts,
  updatePost,
  createPost,
  deletePost,
} from './utils/operations'

const client = getClient()

// SETTING UP TESTING DATA
beforeEach(seedDatabase)

test('should expose published posts', async () => {
  const response = await client.query({ query: getPosts })
  expect(response.data.posts.length).toBe(1) // got back a single post
  expect(response.data.posts[0].published).toBe(true) // must be published
})

test('should fetch all authenticated users posts', async () => {
  const client = getClient(userOne.jwt)
  const response = await client.query({ query: myPosts })
  expect(response.data.myPosts.length).toBe(2) // get back all posts (published and drafts)
})

test('should be able to update own post', async () => {
  const client = getClient(userOne.jwt)
  const variables = {
    id: postOne.post.id,
    data: {
      published: false,
    },
  }
  const response = await client.mutate({ mutation: updatePost, variables })
  const exists = await prisma.exists.Post({
    id: postOne.post.id,
    published: false,
  })
  expect(response.data.updatePost.published).toBe(false) // looking at the response
  expect(exists).toBe(true) // looking at the database
})

test('should create a new post', async () => {
  const client = getClient(userOne.jwt)
  const variables = {
    data: { title: 'A test post', body: '', published: true },
  }
  const response = await client.mutate({ mutation: createPost, variables })
  expect(response.data.createPost.title).toBe('A test post')
  expect(response.data.createPost.body).toBe('')
  expect(response.data.createPost.published).toBe(true)
})

test('should delete a post', async () => {
  const client = getClient(userOne.jwt)
  const variables = {
    id: postTwo.post.id,
  }
  const response = await client.mutate({ mutation: deletePost, variables })
  const exists = await prisma.exists.Post({ id: postTwo.post.id })
  expect(response.data.deletePost.id).toBe(postTwo.post.id)
  expect(exists).toBe(false)
})
