// src/components/ReturnBookPage.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const RETURN_BOOK = gql`
  mutation ReturnBook($userId: ID!, $bookId: ID!) {
    returnBook(userId: $userId, bookId: $bookId) {
      id
      title
      author
      isbn
      available
    }
  }
`;

const ReturnBookPage = () => {
  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [returnBook] = useMutation(RETURN_BOOK);

  const handleReturnBook = async () => {
    try {
      await returnBook({ variables: { userId, bookId } });
      alert('Book returned successfully');
    } catch (error) {
      console.error('Failed to return book', error);
    }
  };

  return (
    <div>
      <h1>Return Book</h1>
      <input type="text" placeholder="User ID" onChange={(e) => setUserId(e.target.value)} />
      <input type="text" placeholder="Book ID" onChange={(e) => setBookId(e.target.value)} />
      <button onClick={handleReturnBook}>Return Book</button>
    </div>
  );
};

export default ReturnBookPage;
