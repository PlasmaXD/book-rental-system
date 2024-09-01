import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Heading, Text, VStack, List, ListItem, Image, Spinner, Button } from '@chakra-ui/react';

const AvailableBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableBooks = async () => {
    try {
      const response = await axios.post('http://localhost:4000/graphql', {
        query: `
          query {
            availableBooks {
              _id
              title
              author
              image_url
              description
              owner {
                id
                username
              }
            }
          }
        `
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        return;
      }
  
      const { data } = response.data;
  
      // 自分が持っている本を除外
      const userId = localStorage.getItem('userId');
      if (data && data.availableBooks) {
        const filteredBooks = data.availableBooks.filter(book => book.owner && book.owner._id !== userId);
        setBooks(filteredBooks);
      } else {
        console.error('Unexpected response data:', response.data);
        setBooks([]);
      }
  
    } catch (error) {
      console.error('Error fetching available books', error);
    } finally {
      setLoading(false);
    }
  };
  

  
  useEffect(() => {
    fetchAvailableBooks();
  }, []);

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box maxW="lg" mx="auto" mt="10" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h1" size="xl" mb="6" textAlign="center">
        Available Books
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
             {book.owner ? (
               <Text fontSize="sm" color="gray.500">Owned by: {book.owner.username}</Text>
             ) : (
               <Text fontSize="sm" color="gray.500">Owner information not available</Text>
             )}
             <Button mt="4" colorScheme="teal" onClick={() => handleBorrowBook(book._id)}>Borrow</Button>
           </Box>
         </ListItem>
       ))}
     </List>
     
      ) : (
        <Text>No books available for borrowing</Text>
      )}
    </Box>
  );
};

const handleBorrowBook = async (bookId) => {
  try {
    const token = localStorage.getItem('token');
    
    // 送信するリクエストボディを確認
    const requestBody = {
      query: `
        mutation {
          borrowBook(bookId: "${bookId}") {
            id
            title
          }
        }
      `
    };

    console.log("GraphQL Request Body:", requestBody);
    console.log("Borrow Book Request:", { bookId, token });

    const response = await axios.post('http://localhost:4000/graphql', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.errors) {
      console.error('Error borrowing book:', response.data.errors);
      alert('Failed to borrow book.');
    } else {
      alert('Book borrowed successfully.');
    }
  } catch (error) {
    console.error('Error borrowing book', error);
    alert('Failed to borrow book.');
  }
};

  
  
export default AvailableBooks;
