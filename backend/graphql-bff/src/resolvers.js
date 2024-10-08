// backend/graphql-bff/src/resolvers.js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const axios = require('axios');
const Book = require('../models/Book');
const User = require('../models/User');

// gRPCクライアントの初期化
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, '../../grpc-server/proto/book.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const bookProto = grpc.loadPackageDefinition(packageDefinition).book;
const grpcServerAddress = process.env.GRPC_SERVER_ADDRESS || 'localhost:50051';
const client = new bookProto.BookService(
  grpcServerAddress,
  grpc.credentials.createInsecure()
);

const resolvers = {
  Query: {
    // 既存のクエリ
    books: async () => {
      return new Promise((resolve, reject) => {
        client.getBooks({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.books);
        });
      });
    },
    book: async (_, { id }) => {
      return new Promise((resolve, reject) => {
        client.getBook({ id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.book);
        });
      });
    },
    availableBooks: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await Book.find({ available: true, owner: { $ne: user.id } }).populate('owner');
    },
    borrowedBooks: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await Book.find({ borrower: user.id }).populate('owner');
    },
    // 新しく追加する getBooks クエリ（Flaskサーバーと通信）
    getBooks: async (_, { searchWord }) => {
      try {
        const response = await axios.get('http://localhost:5000/api/books', {
          params: { search_word: searchWord },
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching books from Flask server:', error.message);
        throw new Error('Failed to fetch books');
      }
    },
  },

  Mutation: {
    // 既存のミューテーション
    addBook: async (_, { title, author, isbn, image_url, description }, { user }) => {
      if (!user) throw new Error('Authentication required');
      console.log("User in addBook:", user);

      // ユーザーの取得
      const existingUser = await User.findById(user.id);
      if (!existingUser) throw new Error('User not found');

      // Bookモデルにownerフィールドを追加し、ユーザーのIDを保存
      const book = new Book({
        title,
        author,
        isbn,
        image_url,
        description,
        available: true,
        owner: existingUser._id,
      });

      console.log("Book being added:", book);

      await book.save();

      // ユーザーのコレクションに本を追加
      existingUser.books.push(book._id);
      await existingUser.save();

      return book;
    },

    rentBook: async (_, { userId, bookId }) => {
      return new Promise((resolve, reject) => {
        client.rentBook({ userId, bookId }, (err, response) => {
          if (err) reject(err);
          else resolve(response.book);
        });
      });
    },

    returnBook: async (_, { bookId }, { user }) => {
      if (!user) throw new Error('Authentication required');

      return new Promise((resolve, reject) => {
        client.returnBook({ userId: user.id, bookId }, (err, response) => {
          if (err) reject(err);
          else resolve(response.book);
        });
      });
    },

    borrowBook: async (_, { bookId }, { user }) => {
      if (!user) throw new Error('Authentication required');

      return new Promise((resolve, reject) => {
        client.borrowBook({ userId: user.id, bookId }, (err, response) => {
          if (err) reject(err);
          else resolve(response.book);
        });
      });
    },
  },

  Book: {
    id: (book) => book._id.toString(), // Mongooseの`_id`をGraphQLの`id`フィールドとして返す
  },
};

module.exports = resolvers;
