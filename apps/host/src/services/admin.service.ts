import { gql, TypedDocumentNode } from '@apollo/client'
import { Query } from '@/@generated/gql/graphql-admin'

// Query to get all announcement popups
export const getAnnouncementPopups: TypedDocumentNode<Pick<Query, 'announcementPopups'>> = gql`
  query GetAnnouncementPopups {
    announcementPopups {
      id
      internalName
      priority
      startTime
      endTime
      status
      frequency
      createdAt
      updatedAt
      data {
        language
        contents {
          title
          description
          imageUrl
          fileType
          buttonText
          buttonLink
        }
      }
    }
  }
`

// Query to get link configs
export const getLinkConfigs: TypedDocumentNode<Pick<Query, 'linkConfigs'>> = gql`
  query LinkConfigs {
    linkConfigs {
      id
      key
      value
      updatedAt
    }
  }
`
