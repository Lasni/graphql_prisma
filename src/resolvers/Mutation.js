import bcrypt from 'bcryptjs'
import getUserId from '../utils/getUserId'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'

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
    const token = generateToken(user.id)
    return {
      token,
      user,
    }
  },
  async createUser(parent, args, { prisma }, info) {
    const hashedPassword = await hashPassword(args.data.password)
    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password: hashedPassword,
      },
    })
    const token = generateToken(user.id)
    return {
      user,
      token,
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
    if (typeof args.data.password === 'string') {
      args.data.password = await hashPassword(args.data.password)
    }
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
    const isPublished = await prisma.exists.Post({
      id: args.id,
      published: true,
    })

    if (!postExists) {
      throw new Error('Unable to update post')
    }

    if (isPublished && args.data.published === false) {
      await prisma.mutation.deleteManyComments({
        where: {
          post: {
            id: args.id,
          },
        },
      })
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
    const postExists = await prisma.exists.Post({
      id: args.data.post,
      published: true,
    })
    if (!postExists) {
      throw new Error('Post does not exist')
    }
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
        id: userId,
      },
    })
    if (!commentExists) {
      throw new Error('Unable to delete comment')
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
        id: userId,
      },
    })
    if (!commentExists) {
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
