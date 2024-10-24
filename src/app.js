console.log('Loading express...');
const express = require('express');
console.log('Loading product routes...');
const productRoutes = require('./routes/productRoute');
console.log('Loading error handler...');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const apiCache = require('apicache');

const app = express();
app.use(express.json());

let cache = apiCache.middleware;
app.use(cache('5 minutes'));

// Serve static files from the 'public' directory (or wherever your index.html is)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/products', productRoutes);

// Error handling middleware
app.use(errorHandler);

// Add a default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Only start the server if we're not in Vercel
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;


// console.log('Loading express...');
// const express = require('express');
// console.log('Loading product routes...');
// const productRoutes = require('./routes/productRoute');
// console.log('Loading error handler...');
// const errorHandler = require('./middleware/errorHandler');
// const http = require('http');

// const app = express();
// app.use(express.json());

// // Routes
// app.use('/api/products', productRoutes);

// // Error handling middleware
// app.use(errorHandler);

// // Add a default route
// app.get('/', (req, res) => {
//   res.send('Server is running');
// });

// // Function to find an available port
// function findAvailablePort(startPort) {
//   return new Promise((resolve, reject) => {
//     const server = http.createServer();
//     server.listen(startPort, () => {
//       server.close(() => {
//         resolve(startPort);
//       });
//     });
//     server.on('error', (err) => {
//       if (err.code === 'EADDRINUSE') {
//         resolve(findAvailablePort(startPort + 1));
//       } else {
//         reject(err);
//       }
//     });
//   });
// }

// // Start the server
// if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
//   findAvailablePort(3000)
//     .then((port) => {
//       app.listen(port, () => {
//         console.log(`Server running on port ${port}`);
//       });
//     })
//     .catch((err) => {
//       console.error('Failed to find an available port', err);
//     });
// }

// module.exports = app;
