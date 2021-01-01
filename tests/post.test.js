import 'cross-fetch/polyfill'
import { gql } from 'apollo-boost'
import seedDatabase from './utils/seedDatabase'
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
