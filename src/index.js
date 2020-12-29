import '@babel/polyfill'
import { GraphQLServer, PubSub } from 'graphql-yoga'
import prisma from './prisma'
import db from './db'
import { resolvers, fragmentReplacements } from './resolvers/index'

const pubsub = new PubSub()

// Server (graphql yoga)
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  fragmentReplacements,
  context(request) {
    return {
      db,
      pubsub,
      prisma,
      request,
    }
  },
})
server.start({ port: process.env.PORT || 4000 }, () =>
  console.log(`Server is up`),
)
