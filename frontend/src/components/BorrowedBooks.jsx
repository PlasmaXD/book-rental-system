import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Heading, Text, VStack, List, ListItem, Image, Spinner, Button } from '@chakra-ui/react';

const BorrowedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Borrowed Books Request Token:", token);

        const response = await axios.post('http://localhost:4000/graphql', {
          query: `
            query {
              borrowedBooks {
                _id
                title
                author
                image_url
                description
                owner {
                  username
                }
              }
            }
          `
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.errors) {
          console.error('GraphQL errors:', response.data.errors);
          response.data.errors.forEach(error => {
            console.error('Error message:', error.message);
            console.error('Error locations:', error.locations);
            console.error('Error path:', error.path);
            console.error('Error extensions:', error.extensions);
          });
        }

        console.log("Borrowed books data:", response.data);
        if (response.data && response.data.data && response.data.data.borrowedBooks) {
          setBooks(response.data.data.borrowedBooks);
        } else {
          console.error('Unexpected response data:', response.data);
          setBooks([]);
        }
      } catch (error) {
        console.error('Error fetching borrowed books', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, []);

  const handleReturnBook = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
  
      console.log("Return Book Request Body:", {
        query: `
          mutation {
            returnBook(bookId: "${bookId}") {
              _id
              title
            }
          }
        `
      });
      console.log("Returning book with ID:", bookId);

  
      const response = await axios.post('http://localhost:4000/graphql', {
        query: `
          mutation {
            returnBook(bookId: "${bookId}") {
              _id
              title
            }
          }
        `
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.data.errors) {
        console.error('Error returning book:', response.data.errors);
        alert('Failed to return book.');
      } else {
        alert('Book returned successfully.');
        setBooks(books.filter(book => book._id !== bookId));
      }
    } catch (error) {
      console.error('Error returning book', error);
      alert('Failed to return book.');
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box maxW="lg" mx="auto" mt="10" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h1" size="xl" mb="6" textAlign="center">
        Borrowed Books
      </Heading>
      {books.length > 0 ? (
        <List spacing={3}>
          {books.map((book) => (
            <ListItem key={book._id}>
              <Box p="4" borderWidth="1px" borderRadius="md" boxShadow="md">
                <Image src={book.image_url} alt={book.title} mb="4" />
                <Text fontSize="lg" fontWeight="bold">{book.title}</Text>
                <Text fontSize="md" color="gray.600">by {book.author}</Text>
                <Text mt="2">{book.description}</Text>
                <Text mt="2" color="blue.600">Borrowed from: {book.owner.username}</Text>

                <Button colorScheme="teal" onClick={() => handleReturnBook(book._id)}>
                  Return Book
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Text>No books borrowed</Text>
      )}
    </Box>
  );
};

export default BorrowedBooks;
