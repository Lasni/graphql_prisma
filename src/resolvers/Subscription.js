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
}

export { Subscription as default }
