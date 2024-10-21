// const express = require('express');
// const productRoutes = require('../routes/productRoutes');
// const errorHandler = require('../middleware/errorHandler');

console.log('Loading express...');
const express = require('express');
console.log('Loading product routes...');
const productRoutes = require('./routes/productRoute');
console.log('Loading error handler...');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;