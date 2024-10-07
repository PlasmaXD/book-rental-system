// src/resolvers.js
const Book = require('../models/Book');
const User = require('../models/User');

const resolvers = {
  
  Query: {
    
    // gRPCクライアントを使用していた部分を削除し、Mongooseを使用
    books: async () => {
      try {
        const books = await Book.find().populate('owner').populate('borrower');
        return books;
      } catch (error) {
        console.error("Error fetching books:", error);
        throw new Error('Failed to fetch books');
      }
    },
    book: async (_, { id }) => {
      try {
        const book = await Book.findById(id).populate('owner').populate('borrower');
        if (!book) {
          throw new Error('Book not found');
        }
        return book;
      } catch (error) {
        console.error("Error fetching book:", error);
        throw new Error('Failed to fetch book');
      }
    },
    availableBooks: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        // 自分の本を除外し、借りられていない本のみを返す
        const books = await Book.find({ available: true, owner: { $ne: user.id } }).populate('owner');
        return books;
      } catch (error) {
        console.error("Error fetching available books:", error);
        throw new Error('Failed to fetch available books');
      }
    },
    borrowedBooks: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      
      try {
        const books = await Book.find({ borrower: user.id }).populate('owner');
        return books;
      } catch (error) {
        console.error("Error fetching borrowed books:", error);
        throw new Error('Failed to fetch borrowed books');
      }
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
      try {
        const book = await Book.findById(bookId);
        if (!book || !book.available) {
          throw new Error('Book is not available');
        }
        book.available = false;
        await book.save();
        return book;
      } catch (error) {
        console.error("Error in rentBook mutation:", error);
        throw new Error(error.message);
      }
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
