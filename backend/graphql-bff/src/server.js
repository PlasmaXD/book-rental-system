// backend/graphql-bff/src/server.js

const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const resolvers = require('./resolvers');
const authRoutes = require('./auth');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Book = require('../models/Book'); // 必要に応じてインポート
require('dotenv').config();

const app = express();

// CORS設定
app.use(cors());

// JSONボディのパース
app.use(express.json());

// 認証エンドポイント
app.use('/api', authRoutes);

// MongoDB接続
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/book-rental';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

// GraphQLスキーマの読み込み
const typeDefs = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');

// Apollo Serverの設定
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    let user = null;

    if (token) {
      try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        user = { id: decoded.userId };
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }

    return { user };
  },
});

// `/api/available-books` エンドポイントを維持
app.get('/api/available-books', async (req, res) => {
  try {
    // ユーザーの認証が必要な場合は、ヘッダーからトークンを取得して検証
    const token = req.headers.authorization || '';
    let user = null;

    if (token) {
      try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        user = { id: decoded.userId };
      } catch (err) {
        console.error('Invalid token:', err);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // ユーザーIDを使用して書籍を取得
    const books = await Book.find({ available: true, owner: { $ne: user.id } }).populate('owner');
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching available books:', error);
    res.status(500).json({ error: 'Failed to fetch available books' });
  }
});

// Apollo Serverの起動とミドルウェアの適用
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
