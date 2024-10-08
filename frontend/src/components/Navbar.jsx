// src/components/Navbar.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Flex, Button, Link } from '@chakra-ui/react';

const Navbar = () => {
  return (
    <Box bg="teal.500" p="4" color="white">
      <Flex maxW="1200px" mx="auto" justifyContent="space-between" alignItems="center">
        <Link as={RouterLink} to="/" fontSize="xl" fontWeight="bold">
          Book Rental System
        </Link>
        <Flex>
          <Link as={RouterLink} to="/my-books" ml="4">
            <Button colorScheme="teal" variant="outline">My Books</Button>
          </Link>
          <Link as={RouterLink} to="/available-books" ml="4">
            <Button colorScheme="teal" variant="outline">Available Books</Button>
          </Link>
          <Link as={RouterLink} to="/borrowed-books" ml="4">
            <Button colorScheme="teal" variant="outline">Borrowed Books</Button>
          </Link>
          {/* <Link as={RouterLink} to="/add-book" ml="4">
            <Button colorScheme="teal" variant="outline">Add Book</Button>
          </Link>
          <Link as={RouterLink} to="/rent-book" ml="4">
            <Button colorScheme="teal" variant="outline">Rent Book</Button>
          </Link>
            <Link as={RouterLink} to="/return-book" ml="4">
            <Button colorScheme="teal" variant="outline">Return Book</Button>
          </Link>
          
          */}
          <Link as={RouterLink} to="/books" ml="4"> 
            <Button colorScheme="teal" variant="outline">Book Search</Button>
          </Link>
        
          <Link as={RouterLink} to="/login" ml="4">
            <Button colorScheme="teal" variant="outline">Login</Button>
          </Link>
        
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
