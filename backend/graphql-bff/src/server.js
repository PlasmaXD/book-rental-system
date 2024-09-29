// src/server.js
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const resolvers = require('./resolvers');
const authRoutes = require('./auth');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// MongoDB 接続
// mongoose.connect('mongodb://localhost:27017/book-rental', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });


// 環境変数 MONGO_URI から接続先を取得（デフォルトは "mongodb://mongo:27017/book_rental_system"）
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/book_rental_system';

// MongoDBに接続
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));




const app = express();
app.use(express.json());
app.use(cors());

// 認証エンドポイント
app.use('/api', authRoutes);

// GraphQL エンドポイント
const typeDefs = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');
// JWT_SECRETを環境変数から取得
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    let user = null;
    // process.env.JWT_SECRET = 'PZpzaR72k47pRUSK4tm7IoxMjZGnj3MP8oXzI0KfnWY=';
    

    if (token) {
      try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        user = { id: decoded.userId };
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }

    return { user };
  }
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
app.get('/api/available-books', async (req, res) => {
  try {
    const books = await Book.find({ available: true, owner: { $ne: user.id } }).populate('owner');
    console.log('Available Books:', books);    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available books' });
  }
});

startServer();
