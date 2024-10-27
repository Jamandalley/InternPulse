# Library Management API

A RESTful API for managing library resources, including books, user accounts, and book borrowing operations, built with Node.js and Express.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features
- Complete book management (CRUD operations)
- Advanced book search and filtering
- ISBN-based book lookup
- User registration and profile management
- Book checkout and return system
- Borrowing history tracking
- Pagination and sorting for book listings
- Comprehensive error handling
- Input validation

## 🛠️ Tech Stack
- Node.js
- Express.js
- Database (SQLite)
- Validator.js for input validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
cd library-management-api
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

## 📚 API Documentation

### Book Management Endpoints

#### Get Books
```
GET /api/books
```
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by (default: 'id')
- `sortOrder`: Sort direction ('ASC' or 'DESC')
- `genre`: Filter by genre
- `author`: Filter by author
- `search`: Search term

#### Search Books
```
GET /api/books/search?q={searchTerm}
```

#### Get Book by ISBN
```
GET /api/books/isbn/{isbn}
```

#### Get Book by ID
```
GET /api/books/{id}
```

#### Create Book
```
POST /api/books
```
Required fields:
- title
- author
- genre
- isbn
- total_copies
- available_copies

#### Update Book
```
PUT /api/books/{id}
PATCH /api/books/{id}
```

#### Delete Book
```
DELETE /api/books/{id}
```

#### Checkout Book
```
POST /api/books/{id}/checkout
```
Required fields:
- userId

#### Return Book
```
POST /api/books/{id}/return
```
Required fields:
- userId

### User Management Endpoints

#### Register User
```
POST /api/users/register
```

#### Get User Profile
```
GET /api/users/{userId}
```

#### Get Borrowing History
```
GET /api/users/{userId}/history
```

#### Get Current Borrowings
```
GET /api/users/{userId}/current-borrowings
```

## 📁 Project Structure
```
library-management-api/
├── controller/
│   ├── libraryController.js    # Book management logic
│   └── userController.js       # User management logic
├── middleware/
│   ├── libraryValidation.js    # Book-related validation
│   └── userValidation.js       # User-related validation
├── routes/
│   ├── libraryRoutes.js        # Book endpoints
│   └── userRoutes.js           # User endpoints
├── services/
│   ├── libraryServices.js      # Book business logic
│   └── userServices.js         # User business logic
└── app.js                      # Application entry point
```

## 📊 Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 409: Conflict (e.g., duplicate ISBN)
- 500: Server Error

## 🔐 Security Considerations
- Implement authentication/authorization
- Add rate limiting for API endpoints
- Use HTTPS in production
- Implement proper CORS policies
- Add input sanitization

## 🎯 Future Improvements
- [ ] Add authentication system
- [ ] Implement rate limiting
- [ ] Add caching layer
- [ ] Add comprehensive logging system
- [ ] Implement API versioning
- [ ] Add Swagger/OpenAPI documentation
- [ ] Add fine management system
- [ ] Implement book reservation system
- [ ] Add email notifications

## 🤝 Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/feature-name`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/feature-name`)
6. Create a Pull Request

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
