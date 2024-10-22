# Product Management API

A RESTful API built with Node.js, Express, and SQLite for managing product information. This API provides endpoints for creating, reading, updating, and deleting products through both ID and name-based operations.

## Features

- Create new products
- Retrieve products by ID or name
- Update products by ID or name
- Delete products by ID or name
- SQLite database for data persistence
- Comprehensive error handling
- Full test coverage
- Detailed API documentation

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/product-management-api.git
cd product-management-api
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
npm run migrate
```

## Running the Application

Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000/api/products`

## Testing

Run the test suite:
```bash
npm test
```

## Project Structure

```
product-management-api/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── database/
│   │   ├── db.js             # Database connection
│   │   └── migrate.js        # Database migrations
│   ├── controllers/
│   │   └── productController.js
│   ├── services/
│   │   └── productService.js
│   ├── routes/
│   │   └── productRoutes.js
│   ├── middleware/
│   │   └── errorHandler.js
│   └── __tests__/
│       └── product.test.js
├── package.json
└── README.md
```

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create a new product |
| GET | `/api/products/id/:id` | Get product by ID |
| GET | `/api/products?name=productName` | Get product by name |
| PUT | `/api/products/id/:id` | Update product by ID |
| PUT | `/api/products?oldName=productName` | Update product by name |
| DELETE | `/api/products/id/:id` | Delete product by ID |
| DELETE | `/api/products?name=productName` | Delete product by name |

## Example Usage

### Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product"}'
```

Response:
```json
{
  "id": 1,
  "name": "Test Product"
}
```

### Get Product by ID

```bash
curl http://localhost:3000/api/products/id/1
```

Response:
```json
{
  "id": 1,
  "name": "Test Product",
  "created_at": "2024-10-21T10:00:00.000Z"
}
```

### Update Product

```bash
curl -X PUT http://localhost:3000/api/products/id/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Product"}'
```

Response:
```json
{
  "id": 1,
  "name": "Updated Product"
}
```

## Error Handling

The API implements comprehensive error handling:

- 400 Bad Request: Invalid input data or missing required fields
- 404 Not Found: Requested resource doesn't exist
- 500 Internal Server Error: Server-side errors

Example error response:
```json
{
  "error": "Product not found"
}
```

## Database Schema

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Development

### Running Tests

The project includes a comprehensive test suite using Jest:

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Adding New Features

1. Create new tests in `src/__tests__/`
2. Implement the feature
3. Ensure all tests pass
4. Update documentation if needed

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Author

[Your Name]

## Support

For support, please open an issue in the GitHub repository or contact [your email].
