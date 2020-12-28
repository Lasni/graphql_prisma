import getUserId from '../utils/getUserId'

const Subscription = {
  comment: {
    subscribe(parent, args, ctx, info) {
      const { prisma } = ctx
      return prisma.subscription.comment(
        {
          where: {
            node: {
              post: {
                id: args.postId,
              },
            },
          },
        },
        info,
      )
    },
  },
  post: {
    subscribe(parent, args, ctx, info) {
      const { prisma } = ctx
      return prisma.subscription.post(
        {
          where: {
            node: {
              published: true,
            },
          },
        },
        info,
      )
    },
  },
  myPost: {
    subscribe(parent, args, ctx, info) {
      const { prisma, request } = ctx
      const userId = getUserId(request)
      return prisma.subscription.post(
        {
          where: {
            node: {
              author: {
                id: userId,
              },
            },
          },
        },
        info,
      )
    },
  },
}

export { Subscription as default }
