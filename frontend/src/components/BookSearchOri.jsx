import React, { useState } from 'react';
import axios from 'axios';
import { Box, Heading, Text, VStack, List, ListItem, Image, Spinner, Input, Button } from '@chakra-ui/react';

const BookSearch = () => {
  const [searchWord, setSearchWord] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/books', {
        params: { search_word: searchWord }
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt="10" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h1" size="xl" mb="6" textAlign="center">
        Book Search
      </Heading>
      <VStack spacing="4">
        <Input placeholder="Search for books..." value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
        <Button colorScheme="teal" onClick={handleSearch}>Search</Button>
      </VStack>
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
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Text>No books found</Text>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default BookSearch;
