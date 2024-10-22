# Product Management API

A RESTful API for managing product information, built with Node.js, Express, and SQLite.

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://internpulse-3.onrender.com)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features
- Create, read, update, and delete products
- Search products by ID or name
- Consistent error handling
- SQLite database for data persistence
- Comprehensive test suite
- Production-ready configuration

## 🛠️ Tech Stack
- Node.js
- Express.js
- SQLite3
- Jest (Testing)
- Supertest (API Testing)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
cd product-management-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run migrate
```

4. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## ⚙️ Configuration
The application uses the following environment variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Application environment (development/production/test)

## 📚 API Documentation

### Base URL
```
https://internpulse-3.onrender.com
```

### Endpoints

#### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products/create-product` | Create a new product |
| GET | `/api/products/all-products` | Get all products |
| GET | `/api/products/id/:id` | Get product by ID |
| GET | `/api/products/name` | Get product by name |
| PUT | `/api/products/update/:id` | Update product by ID |
| PUT | `/api/products/update` | Update product by name |
| DELETE | `/api/products/delete/:id` | Delete product by ID |
| DELETE | `/api/products/delete` | Delete product by name |

### Example Request
```bash
curl -X POST https://internpulse-3.onrender.com/api/products/create-product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Product",
    "price": 99.99,
    "description": "Product description"
  }'
```

For detailed API documentation, please visit the [API Documentation]([https://internpulse-3.onrender.com/api-docs](https://etechnosoft.gitbook.io/internpulse-product-management-api/)).

## 🧪 Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Deployment
The API is deployed on [Render](https://render.com). To deploy your own instance:

1. Create a new Web Service on Render
2. Connect your repository
3. Configure the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables (if any)

## 📁 Project Structure
```
product-management-api/
├── src/
│   ├── app.js              # Application entry point
│   ├── routes/             # Route definitions
│   ├── controllers/        # Route controllers
│   ├── services/          # Business logic
│   ├── database/          # Database configuration
│   └── middleware/        # Custom middleware
├── tests/                 # Test files
├── package.json          # Project dependencies
├── README.md            # Project documentation
└── .gitignore          # Git ignore file
```

## 🤝 Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/feature-name`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/feature-name`)
6. Create a Pull Request

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛟 Support
For support, please:
1. Check the [API Documentation](https://internpulse-3.onrender.com/api-docs)
2. Open an issue
3. Contact the maintainers

## ✅ Requirements
- Node.js 14.x or higher
- npm 6.x or higher
- SQLite 3.x

## 🔍 Common Issues and Solutions

### API returns 500 error
- Check if the database is properly migrated
- Verify all required environment variables are set
- Check server logs for detailed error messages

### Database migration fails
```bash
# Reset the database
rm src/database/database.sqlite
npm run migrate
```

### Port already in use
```bash
# Kill the process using the port
lsof -i :3000
kill -9 <PID>
```

## 📊 Status Codes
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## 🔐 Security Considerations
- The API currently doesn't implement authentication
- Use HTTPS in production
- Implement rate limiting for production use
- Consider adding input validation middleware
- Implement proper CORS policies

## 🎯 Future Improvements
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Add pagination for large datasets
- [ ] Add caching layer
- [ ] Implement logging system
- [ ] Add data validation middleware
- [ ] Add API versioning
- [ ] Implement Swagger documentation
