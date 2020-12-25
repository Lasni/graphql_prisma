import getUserId from '../utils/getUserId'

const Query = {
  async me(parent, args, ctx, info) {
    const { prisma, request } = ctx
    const userId = getUserId(request)
    const user = prisma.query.user(
      {
        where: {
          id: userId,
        },
      },
      info,
    )
    return user
  },
  async post(parent, args, ctx, info) {
    const { prisma, request } = ctx
    const userId = getUserId(request, false)

    const posts = await prisma.query.posts(
      {
        where: {
          id: args.id,
          OR: [
            {
              published: true,
            },
            {
              author: {
                id: userId,
              },
            },
          ],
        },
      },
      info,
    )
    if (posts.length === 0) {
      throw new Error('Posts not found')
    }
    return posts[0]
  },
  users(parent, args, { prisma }, info) {
    const opArgs = {}

    if (args.query) {
      opArgs.where = {
        OR: [
          {
            name_contains: args.query,
          },
        ],
      }
    }

    return prisma.query.users(opArgs, info)
  },
  async posts(parent, args, { prisma }, info) {
    const opArgs = {
      where: {
        published: true,
      },
    }
    if (args.query) {
      opArgs.where.OR = [
        {
          title_contains: args.query,
        },
        {
          body_contains: args.query,
        },
      ]
    }
    const posts = await prisma.query.posts(opArgs, info)
    return posts
  },
  async myPosts(parent, args, ctx, info) {
    const { prisma, request } = ctx
    const userId = getUserId(request)
    const opArgs = {
      where: {
        author: {
          id: userId,
        },
      },
    }
    if (args.query) {
      opArgs.where.OR = [
        {
          title_contains: args.query,
        },
        {
          body_contains: args.query,
        },
      ]
    }
    const posts = await prisma.query.posts(opArgs, info)
    return posts
  },
  comments(parent, args, { prisma }, info) {
    return prisma.query.comments(null, info)
  },
}

export { Query as default }
