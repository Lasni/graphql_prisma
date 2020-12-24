import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getUserId from '../utils/getUserId'

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
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    const user = await prisma.mutation.deleteUser(
      { where: { id: userId } },
      info,
    )
    return user
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    return prisma.mutation.updateUser(
      {
        data: args.data,
        where: {
          id: userId,
        },
      },
      info,
    )
  },
  async createPost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    return prisma.mutation.createPost(
      {
        data: {
          title: args.data.title,
          body: args.data.body,
          published: args.data.published,
          author: {
            connect: {
              id: userId,
            },
          },
        },
      },
      info,
    )
  },
  async deletePost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId,
      },
    })

    if (!postExists) {
      throw new Error('Unable to find post')
    }

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
    const { prisma, request } = ctx
    const userId = getUserId(request)
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId,
      },
    })
    if (!postExists) {
      throw new Error('Unable to update post')
    }
    return prisma.mutation.updatePost(
      {
        data: args.data,
        where: {
          id: args.id,
        },
      },
      info,
    )
  },
  async createComment(parent, args, ctx, info) {
    const { prisma, request } = ctx
    const userId = getUserId(request)
    return prisma.mutation.createComment(
      {
        data: {
          text: args.data.text,
          post: {
            connect: {
              id: args.data.post,
            },
          },
          author: {
            connect: {
              id: userId,
            },
          },
        },
      },
      info,
    )
  },
  async deleteComment(parent, args, ctx, info) {
    const { prisma, request } = ctx
    const userId = getUserId(request)
    const commentExists = await prisma.exists.Comment({
      id: args.id,
      author: {
        id: userId
      }
    })
    if (!commentExists) {
      throw new Error ('Unable to delete comment')
    }
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
    const { prisma, request } = ctx
    const userId = getUserId(request)
    const commentExists = await prisma.exists.Comment({
      id: args.id,
      author: {
        id: userId
      }
    })
    if(!commentExists) {
      throw new Error('Unable to update comment')
    }
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
