import { gql } from '@generated'

export const agentMessagesQuery = gql(`
  query ArbAgentMessages($urn: String!) {
    arbAgentMessages(urn: $urn) {
      id
      direction
      text
      createdOn
      attachments
    }
  }
`)

export const sendAgentMessageMutation = gql(`
  mutation ArbSendAgentMessage(
    $from: String!
    $message: String!
    $contactName: String
  ) {
    arbSendAgentMessage(
      from: $from
      message: $message
      contactName: $contactName
    )
  }
`)
