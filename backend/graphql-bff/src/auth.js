// src/auth.js
const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const router = express.Router();
const nodemailer = require('nodemailer'); // メール送信用
// process.env.JWT_SECRET = 'PZpzaR72k47pRUSK4tm7IoxMjZGnj3MP8oXzI0KfnWY=';
require('dotenv').config();

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log("Received data:", { username, password, email }); // デバッグ用ログ
    // ユーザー名が既に存在するかをチェック
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: 'Username is already taken' });
    }
    const user = new User({ username, password, email, books: [] }); // books を空配列で初期化
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error during registration:", error); // エラーログを出力
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 平文パスワードの比較（開発中のみ）
    // const isMatch = password === user.password;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,{ expiresIn: '100h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/forgot-password', async (req, res) => {
  const { email, username } = req.body;

  try {
    const user = await User.findOne({ username, email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // メールの設定と送信
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'パスワードリセット',
      text: `以下のリンクをクリックしてパスワードをリセットしてください: ${resetLink}`,
    });

    res.json({ message: 'パスワードリセットリンクがメールアドレスに送信されました。' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/my-books', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('books');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.books);
  } catch (error) {
    console.error('Error fetching user books:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
