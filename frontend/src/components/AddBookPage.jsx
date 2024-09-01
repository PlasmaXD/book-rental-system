// src/components/AddBookPage.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const ADD_BOOK = gql`
  mutation AddBook($title: String!, $author: String!, $isbn: String!) {
    addBook(title: $title, author: $author, isbn: $isbn) {
      id
      title
      author
      isbn
      available
    }
  }
`;

const AddBookPage = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [addBook] = useMutation(ADD_BOOK);

  const handleAddBook = async () => {
    try {
      await addBook({ variables: { title, author, isbn } });
      alert('Book added successfully');
    } catch (error) {
      console.error('Failed to add book', error);
    }
  };

  return (
    <div>
      <h1>Add New Book</h1>
      <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Author" onChange={(e) => setAuthor(e.target.value)} />
      <input type="text" placeholder="ISBN" onChange={(e) => setIsbn(e.target.value)} />
      <button onClick={handleAddBook}>Add Book</button>
    </div>
  );
};

export default AddBookPage;
