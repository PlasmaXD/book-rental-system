const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../../grpc-server/proto/book.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const bookProto = grpc.loadPackageDefinition(packageDefinition).book;
const client = new bookProto.BookService('localhost:50051', grpc.credentials.createInsecure());
const Book = require('../models/Book');
const User = require('../models/User');

const resolvers = {
  
  Query: {
    
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
      
      // 自分の本を除外し、借りられていない本のみを返す
      return await Book.find({ available: true, owner: { $ne: user.id } }).populate('owner');
    },
    borrowedBooks: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      return await Book.find({ borrower: user.id }).populate('owner');
    },
  },

  Book: {
    id: (book) => book._id.toString(), // Mongooseの`_id`をGraphQLの`id`フィールドとして返す
  },
  Mutation: {
    addBook: async (_, { title, author, isbn, image_url, description }, { user }) => {
      if (!user) throw new Error('Authentication required');
      console.log("User in addBook:", user);
    
      // `user` ID を使ってユーザーを再取得する
      const existingUser = await User.findById(user.id);
      if (!existingUser) throw new Error('User not found');
    
      // books フィールドがない場合は初期化
      if (!existingUser.books) {
        existingUser.books = [];
      }
    
      // Bookモデルにownerフィールドを追加し、ユーザーのIDを保存
      const book = new Book({
        title,
        author,
        isbn,
        image_url,
        description,
        available: true,
        owner: existingUser._id,  // 本を登録したユーザーのIDをownerフィールドに設定
      });
    
      console.log("Book being added:", book);
    
      await book.save();
    
      // ユーザーのコレクションに本を追加
      existingUser.books.push(book._id);
      await existingUser.save();
    
      return book;
    },
    
    rentBook: async (_, { userId, bookId }) => {
      const book = await Book.findById(bookId);
      if (!book || !book.available) {
        throw new Error('Book is not available');
      }
      book.available = false;
      return await book.save();
    },
    borrowBook: async (_, { bookId }, { user }) => {
      try {
        if (!user) throw new Error('Authentication required');
    
        console.log("User ID:", user.id);
        console.log("Book ID:", bookId);
    
        const book = await Book.findById(bookId);
        if (!book) {
          throw new Error('Book not found');
        }
    
        if (!book.available) {
          throw new Error('Book is not available for borrowing');
        }
    
        if (String(book.owner) === String(user.id)) {
          throw new Error('You cannot borrow your own book');
        }
    
        book.available = false;
        book.borrower = user.id; // borrower_id ではなく borrower に設定
        await book.save();
    
        return book;
      } catch (error) {
        console.error("Error in borrowBook mutation:", error.message);
        throw new Error(error.message);
      }
    },
    
  
    returnBook: async (_, { bookId }, { user }) => {
      try {
        if (!user) throw new Error('Authentication required');
    
        console.log("User ID:", user.id);
        console.log("Book ID:", bookId);
    
        const book = await Book.findById(bookId);
        if (!book) {
          throw new Error('Book not found');
        }
    
        if (String(book.borrower) !== String(user.id)) {
          throw new Error('You can only return books you have borrowed');
        }
    
        book.available = true;
        book.borrower = null; // 借りたユーザーの情報をクリア
        await book.save();
    
        return book;
      } catch (error) {
        console.error("Error in returnBook mutation:", error.message);
        throw new Error(error.message);
      }
    },
    
  },
};

module.exports = resolvers;
