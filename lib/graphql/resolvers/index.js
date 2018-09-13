import { mergeResolvers } from 'merge-graphql-schemas'

import userResolver from './user'
import postResolver from './post.'

const resolvers = [
  userResolver,
  postResolver
]

export default mergeResolvers(resolvers)
