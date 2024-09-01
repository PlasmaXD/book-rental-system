import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Heading, Text, VStack, List, ListItem, Image, Spinner } from '@chakra-ui/react';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/my-books', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box maxW="lg" mx="auto" mt="10" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h1" size="xl" mb="6" textAlign="center">
        My Books
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
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Text>No books found</Text>
      )}
    </Box>
  );
};

export default MyBooks;
