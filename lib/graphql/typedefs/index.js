import { mergeTypes } from 'merge-graphql-schemas'

import userType from './user.graphql'
import postType from './post.graphql'

const types = [
  userType,
  postType,
]

export default mergeTypes(types)
