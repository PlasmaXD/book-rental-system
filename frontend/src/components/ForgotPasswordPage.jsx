import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const handlePasswordReset = async () => {
    try {
      await axios.post('http://localhost:4000/api/forgot-password', { email, username });
      alert('パスワードリセットリンクがメールアドレスに送信されました。');
    } catch (error) {
      console.error('Failed to send password reset link', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt="10" p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Text fontSize="2xl" mb="4">パスワードリセット</Text>
      <VStack spacing="4">
        <Input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <Input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
        <Button colorScheme="teal" onClick={handlePasswordReset}>リセットリンクを送る</Button>
      </VStack>
    </Box>
  );
};

export default ForgotPasswordPage;
