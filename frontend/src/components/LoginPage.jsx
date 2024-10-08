import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Input, Text, Link, VStack } from '@chakra-ui/react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const handleLogin = async () => {
    try {
       const response = await axios.post(`${apiUrl}/api/login`, { username, password });
    //  const response = await axios.post(`http://graphql-bff:4000/api/login`, { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);  
      navigate('/books');
    } catch (error) {
      console.error('Login failed', error);
      alert(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt="10" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Text fontSize="2xl" mb="4">Login</Text>
      <VStack spacing="4">
        <Input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
        <Button colorScheme="teal" onClick={handleLogin}>Login</Button>
        <Link as={RouterLink} to="/register" color="teal.500">初めての方はこちらから登録</Link>
        <Link as={RouterLink} to="/forgot-password" color="teal.500">パスワードを忘れた方はこちら</Link>
      </VStack>
    </Box>
  );
};

export default LoginPage;
