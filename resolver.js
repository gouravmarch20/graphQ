const data = {
  authors: [
    { id: "1", name: "git", bookIds: ["101", "102"] },
    { id: "2", name: "uit", bookIds: ["33", "32"] },
  ],
  books: [
    { id: "101", title: "book 1 ", publishedYear: 2024, authorId: "1" },
    { id: "102", title: "book 3 ", publishedYear: 2010, authorId: "2" },
  ],
};
export const resolvers = {
  Query: {
    authors: () => {
      return data.authors
    },
    books: () => {
      return  data.books
    },
  },
};
