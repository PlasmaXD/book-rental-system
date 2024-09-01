import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Heading, Text, VStack, List, ListItem, Image, Spinner, Button } from '@chakra-ui/react';

const BookLendingPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/available-books');
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching available books', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleLendBook = async (book) => {
    try {
      const response = await axios.post('http://localhost:5000/api/lend-book', {
        book_id: book._id,
        user_id: localStorage.getItem('user_id'), // 借りるユーザーのID
      });
      console.log('Book lending requested:', response.data);
    } catch (error) {
      console.error('Error lending book', error);
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt="10" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h1" size="xl" mb="6" textAlign="center">
        Available Books for Lending
      </Heading>
      {loading ? (
        <Spinner size="xl" mt="6" />
      ) : (
        <VStack spacing="6" mt="6">
          {books.length > 0 ? (
            <List spacing={3}>
              {books.map((book, index) => (
                <ListItem key={index}>
                  <Box p="4" borderWidth="1px" borderRadius="md" boxShadow="md">
                    <Image src={book.image_url} alt={book.title} mb="4" />
                    <Text fontSize="lg" fontWeight="bold">{book.title}</Text>
                    <Text fontSize="md" color="gray.600">by {book.author}</Text>
                    <Text mt="2">{book.description}</Text>
                    <Button colorScheme="green" onClick={() => handleLendBook(book)}>Request to Borrow</Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Text>No books available for lending</Text>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default BookLendingPage;
