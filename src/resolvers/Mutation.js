import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const Mutation = {
  async login(parent, args, ctx, info) {
    const { prisma } = ctx

    const user = await prisma.query.user({
      where: {
        email: args.data.email,
      },
    })
    if (!user) {
      throw new Error('Unable to log in')
    }

    const isMatch = await bcrypt.compare(args.data.password, user.password)
    if (!isMatch) {
      throw new Error('Unable to log in')
    }

    const token = jwt.sign({ userId: user.id }, 'myjwtsecret')

    return {
      token,
      user,
    }
  },
  async createUser(parent, args, { prisma }, info) {
    if (args.data.password.length < 8) {
      throw new Error('Password must be 8 characters or longer')
    }
    const hashedPassword = await bcrypt.hash(args.data.password, 10)
    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password: hashedPassword,
      },
    })
    return {
      user,
      token: jwt.sign({ userId: user.id }, 'myjwtsecret'),
    }
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
