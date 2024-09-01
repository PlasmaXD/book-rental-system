import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const RENT_BOOK = gql`
  mutation RentBook($userId: ID!, $bookId: ID!) {
    rentBook(userId: $userId, bookId: $bookId) {
      id
      title
      author
      isbn
      available
    }
  }
`;

const RentBookPage = () => {
  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [rentBook] = useMutation(RENT_BOOK);

  const handleRentBook = async () => {
    try {
      await rentBook({ variables: { userId, bookId } });
      alert('Book rented successfully');
    } catch (error) {
      console.error('Failed to rent book', error);
      alert(`Failed to rent book: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Rent Book</h1>
      <input type="text" placeholder="User ID" onChange={(e) => setUserId(e.target.value)} />
      <input type="text" placeholder="Book ID" onChange={(e) => setBookId(e.target.value)} />
      <button onClick={handleRentBook}>Rent Book</button>
    </div>
  );
};

export default RentBookPage;
