// src/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  user_id: String,
  title: String,
  author: String,
  image_url: String,
  description: String,
  available: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // 持ち主のユーザーID
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // borrower_id から borrower に変更
  
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
