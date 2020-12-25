import getUserId from '../utils/getUserId'

const User = {
  email: {
    fragment: 'fragment userId on User { id }',
    resolve(parent, args, ctx, info) {
      const { request } = ctx
      const userId = getUserId(request, false)
      if (userId && userId === parent.id) {
        return parent.email
      } else return null
    },
  },
  posts: {
    fragment: 'fragment userId on User { id }',
    async resolve(parent, args, ctx, info) {
      const { prisma } = ctx
      const posts = await prisma.query.posts({
        where: {
          published: true,
          author: {
            id: parent.id,
          },
        },
      })
      return posts
    },
  },
}

export { User as default }
