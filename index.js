require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Configurations
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const authMiddleware = require('./middleware/auth');

// Initialize Express app
const app = express();

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

// Middleware Configuration
const configureMiddleware = () => {
  // CORS Configuration
  const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Rate Limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later'
  }));
};

// Apollo Server Configuration
const createApolloServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, res }) => ({
      ...(await authMiddleware(req)),
      req,
      res
    }),
    csrfPrevention: true,
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [
      // Add any Apollo plugins here
    ]
  });
};

// Server Startup
const startServer = async () => {
  try {
    await connectDB();
    configureMiddleware();

    const apolloServer = createApolloServer();
    await apolloServer.start();

    apolloServer.applyMiddleware({ 
      app,
      cors: false,
      path: '/graphql'
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

// Start the application
startServer();