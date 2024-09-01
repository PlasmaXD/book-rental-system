import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';  // Navbarコンポーネントをインポート
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import BookSearch from './components/BookSearch';
import AddBookPage from './components/AddBookPage';
import RentBookPage from './components/RentBookPage';
import ReturnBookPage from './components/ReturnBookPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import MyBooks from './components/MyBooks';  
import AvailableBooks from './components/AvailableBooks';
import BorrowedBooks from './components/BorrowedBooks';
function App() {
  return (
    <ChakraProvider>
      <Router>
        <Navbar />  
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/books" element={<BookSearch />} />
          <Route path="/add-book" element={<AddBookPage />} />
          <Route path="/rent-book" element={<RentBookPage />} />
          <Route path="/return-book" element={<ReturnBookPage />} />
          <Route path="/my-books" element={<MyBooks />} />  
          <Route path="/" element={<LoginPage />} />
          <Route path="/available-books" element={<AvailableBooks />} />
          <Route path="/borrowed-books" element={<BorrowedBooks />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
