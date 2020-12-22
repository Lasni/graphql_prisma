import uuidv4 from 'uuid/v4'

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const user = await prisma.mutation.createUser({ data: args.data }, info)
    return user
  },
  async deleteUser(parent, args, { prisma }, info) {
    const user = await prisma.mutation.deleteUser(
      { where: { id: args.id } },
      info,
    )
    return user
  },
  async updateUser(parent, args, { prisma }, info) {
    return prisma.mutation.updateUser(
      {
        data: args.data,
        where: {
          id: args.id,
        },
      },
      info,
    )
  },
  async createPost(parent, args, { prisma }, info) {
    return prisma.mutation.createPost(
      {
        data: {
          title: args.data.title,
          body: args.data.body,
          published: args.data.published,
          author: {
            connect: {
              id: args.data.author,
            },
          },
        },
      },
      info,
    )
  },
  async deletePost(parent, args, { prisma }, info) {
    return prisma.mutation.deletePost(
      {
        where: {
          id: args.id,
        },
      },
      info,
    )
  },
  async updatePost(parent, args, ctx, info) {
    const { prisma } = ctx
    return prisma.mutation.updatePost(
      {
        where: {
          id: args.id,
        },
        data: args.data,
      },
      info,
    )
  },
  async createComment(parent, args, { prisma }, info) {
    return prisma.mutation.createComment(
      {
        data: {
          text: args.data.text,
          author: {
            connect: {
              id: args.data.author,
            },
          },
          post: {
            connect: {
              id: args.data.post,
            },
          },
        },
      },
      info,
    )
  },
  async deleteComment(parent, args, { prisma }, info) {
    return prisma.mutation.deleteComment(
      {
        where: {
          id: args.id,
        },
      },
      info,
    )
  },
  async updateComment(parent, args, ctx, info) {
    const { prisma } = ctx
    return prisma.mutation.updateComment(
      {
        data: args.data,
        where: {
          id: args.id,
        },
      },
      info,
    )
  },
}

export { Mutation as default }
