import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Author {
    id: ID!
    name: String!
    books : [Book]
  }

  type Book {
    id: ID!
    title: String!
    publishedYear: Int!
    author  : Author
  }

  type Query {
    authors: [Author!]!
    books: [Book!]!
  }
`;