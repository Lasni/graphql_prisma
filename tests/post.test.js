import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import prisma from '../src/prisma'
import seedDatabase, { userOne, postOne, postTwo } from './utils/seedDatabase'
import getClient from './utils/getClient'

const client = getClient()

// SETTING UP TESTING DATA
beforeEach(seedDatabase)

test('should expose published posts', async () => {
  const getPosts = gql`
    query {
      posts {
        id
        title
        body
        published
      }
    }
  `
  const response = await client.query({ query: getPosts })
  expect(response.data.posts.length).toBe(1) // got back a single post
  expect(response.data.posts[0].published).toBe(true) // must be published
})

test('should fetch all authenticated users posts', async () => {
  const client = getClient(userOne.jwt)
  const myPosts = gql`
    query {
      myPosts {
        id
        title
        body
        published
      }
    }
  `
  const response = await client.query({ query: myPosts })
  expect(response.data.myPosts.length).toBe(2) // get back all posts (published and drafts)
})

test('should be able to update own post', async () => {
  const client = getClient(userOne.jwt)
  const updatePost = gql`
    mutation {
      updatePost(
        id: "${postOne.post.id}", 
        data: {
          published: false
        }
      ){
        id
        title
        body
        published
      }
    }
  `
  const response = await client.mutate({ mutation: updatePost })
  const exists = await prisma.exists.Post({
    id: postOne.post.id,
    published: false,
  })

  expect(response.data.updatePost.published).toBe(false) // looking at the response
  expect(exists).toBe(true) // looking at the database
})

test('should create a new post', async () => {
  const client = getClient(userOne.jwt)
  const createPost = gql`
    mutation {
      createPost(data: { title: "A test post", body: "", published: true }) {
        id
        title
        body
        published
      }
    }
  `
  const response = await client.mutate({ mutation: createPost })
  expect(response.data.createPost.title).toBe('A test post')
  expect(response.data.createPost.body).toBe('')
  expect(response.data.createPost.published).toBe(true)
})

test('should delete a post', async () => {
  const client = getClient(userOne.jwt)
  const deletePost = gql`
    mutation {
      deletePost(
        id: "${postTwo.post.id}"
      ){
        id
      }
    }
  `
  const response = await client.mutate({ mutation: deletePost })
  const exists = await prisma.exists.Post({ id: postTwo.post.id })

  expect(response.data.deletePost.id).toBe(postTwo.post.id)
  expect(exists).toBe(false)
})
