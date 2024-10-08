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
      const response = await axios.post('http://localhost:4000/graphql', {
        query: `
          query {
            getBooks(searchWord: "${searchWord}") {
              title
              author
              image_url
              description
            }
          }
        `
      });

      console.log("Books data received:", response.data);  // デバッグ用ログ

      // GraphQLのレスポンスからデータを取得
      if (response.data && response.data.data && Array.isArray(response.data.data.getBooks)) {
        setBooks(response.data.data.getBooks);
      } else {
        console.error('Unexpected response data:', response.data);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books', error);
      setBooks([]); // エラー時は空のリストにする
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book) => {
    try {
      const { title, author, isbn, image_url, description } = book;

      // ローカルストレージからトークンを取得
      const token = localStorage.getItem('token');
      // console.log("Token:", token);  // トークンが取得できているか確認
      if (!token) {
        alert('You must be logged in to add a book.');
        return;
      }
      // GraphQL ミューテーションを実行して本を追加
      const response = await axios.post('http://localhost:4000/graphql', {
        query: `
          mutation {
            addBook(title: "${title}", author: "${author}", isbn: "${isbn}", image_url: "${image_url}", description: "${description}") {
              id
              title
            }
          }
        `
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // トークンをヘッダーに追加
        }
      });

      if (response.data.errors) {
        console.error('Error adding book:', response.data.errors);
        response.data.errors.forEach((error) => {
          console.log('Error details:', error.message);
        });
        alert('Failed to add book to your collection.');
      } else {
        alert(`${title} has been added to your collection.`);
      }
    } catch (error) {
      console.error('Error adding book', error);
      alert('Failed to add book to your collection.');
    }
  };

  return (
    <Box maxW="lg" mx="auto" mt="10" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading as="h1" size="xl" mb="6" textAlign="center">
        Book Search
      </Heading>
      <VStack spacing="4">
        <Input
          placeholder="Search for books..."
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />
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
                    <Button mt="4" colorScheme="teal" onClick={() => handleAddBook(book)}>Add to My Collection</Button>
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
