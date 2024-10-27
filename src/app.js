console.log('Loading express...');
const express = require('express');

console.log('Loading Path...')
const path = require('path');

console.log('Loading Swagger Configuration...')
const loadSwaggerConfig = require('./swagger/swagger.js');

console.log('Loading library routes...');
const libraryRouter = require('./routes/libraryRoutes');

console.log('Loading user routes...');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(express.json());

// Initialize Swagger documentation
loadSwaggerConfig(app)
  .catch(err => {
    console.error('Failed to initialize Swagger:', err);
    process.exit(1);
  });

// Use the bookRouter for book-related routes
app.use('/api/v1/books', libraryRouter);

app.use('/api/v1/users', userRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger docs available at https://internpulse-4.onrender.com/api-docs/`);
  });
}

module.exports = app;