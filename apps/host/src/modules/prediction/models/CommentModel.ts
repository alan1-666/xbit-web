import { Comment } from '@/@generated/gql/graphql-prediction.ts'

export type CommentModel = Comment

export type CommentWithReplies = CommentModel & { replies: CommentWithReplies[] }
