// src/__tests__/product.test.js
const request = require('supertest');
const app = require('../app');
const { createTables } = require('../database/migrate');
const db = require('../database/db');

beforeAll(async () => {
    await createTables();
});

afterEach(async () => {
    await db.run('DELETE FROM products');
});

afterAll(async () => {
    await db.close();
});

describe('Product Management API', () => {
    describe('POST /api/products', () => {
        it('should create a new product', async () => {
            const res = await request(app)
            .post('/api/products/create-product')
            .send({ name: 'Test Product', price: 100, description: 'A test product' }); 
            
            expect(res.statusCode).toBe(201);
            expect(res.body.IsSuccessful).toBe(true); 
            expect(res.body.data[0]).toHaveProperty('id'); // Check if product has an id
            expect(res.body.data[0].name).toBe('Test Product'); // Check the name of the product
        });
    
        it('should return 400 if name is missing', async () => {
            const res = await request(app)
            .post('/api/products/create-product')
            .send({ price: 100, description: 'A product without a name' }); // Sending price and description only
            
            expect(res.statusCode).toBe(400);
            expect(res.body.IsSuccessful).toBe(false); // Adjusted to match response model
            expect(res.body.message).toBe('Product name is required'); // Check for the specific error message
        });
    
        it('should return 400 if name is not unique', async () => {
            await request(app) // Create a product first
            .post('/api/products/create-product')
            .send({ name: 'Unique Product', price: 50, description: 'A unique product' });
            
            const res = await request(app)
            .post('/api/products/create-product')
            .send({ name: 'Unique Product', price: 75 }); // Attempt to create the same product
            
            expect(res.statusCode).toBe(400);
            expect(res.body.IsSuccessful).toBe(false); // Check if response indicates failure
            expect(res.body.message).toBe('Product with this name already exists.'); // Check for unique constraint error
        });

        it('should return 400 if price is negative', async () => {
            const res = await request(app)
                .post('/api/products/create-product')
                .send({ name: 'Negative Price Product', price: -50, description: 'A product with a negative price' });
            
            expect(res.statusCode).toBe(400);
            expect(res.body.IsSuccessful).toBe(false);
            expect(res.body.message).toBe('Product price must be a positive number'); // Assuming you have such validation in place
        });
    });

    describe('GET /api/products/id/:id', () => {
        it('should get product by id', async () => {
          // First, create a product to ensure it exists
          const createRes = await request(app)
            .post('/api/products/create-product')
            .send({ name: 'Test Product', price: 100, description: 'A test product' });
      
          // Check if the product was created successfully
          expect(createRes.statusCode).toBe(201);
          const productId = createRes.body.data[0].id; // Retrieve the ID of the created product
      
          // Now, get the product by ID
          const res = await request(app)
            .get(`/api/products/id/${productId}`); // Use the retrieved ID
          
          expect(res.statusCode).toBe(200);
          expect(res.body.IsSuccessful).toBe(true); // Check for success in the response
          expect(res.body.data).toHaveProperty('id', productId); // Ensure the response contains the correct ID
          expect(res.body.data.name).toBe('Test Product'); // Check the name of the product
        });
      
        it('should return 404 if product not found', async () => {
          const res = await request(app)
            .get('/api/products/id/999'); // ID that does not exist
          
          expect(res.statusCode).toBe(404);
          expect(res.body.IsSuccessful).toBe(false); // Ensure the response indicates failure
          expect(res.body.message).toBe('Product not found'); // Check for the specific error message
        });
    });

    describe('GET /api/products', () => {
        it('should get product by name', async () => {
          // First, create a product to ensure it exists
            const createRes = await request(app)
                .post('/api/products/create-product')
                .send({ name: 'Test Product', price: 100, description: 'A test product' });
        
            // Check if the product was created successfully
            expect(createRes.statusCode).toBe(201);
            
            // Now, get the product by name
            const res = await request(app)
                .get('/api/products/name')
                .query({ name: 'Test Product' });

            expect(res.statusCode).toBe(200);
            expect(res.body.IsSuccessful).toBe(true); // Check for success in the response
            expect(res.body.data).toBeDefined(); // Ensure the data is present
            expect(res.body.data).toHaveProperty('name'); // Check for the presence of an id
            expect(res.body.data.name).toBe('Test Product'); // Check the name of the product
        });
      
        it('should return 404 if product not found', async () => {
            const res = await request(app)
                .get('/api/products/name')
                .query({ name: 'Nonexistent Product' });
            
            expect(res.statusCode).toBe(404);
            expect(res.body.IsSuccessful).toBe(false); // Ensure the response indicates failure
            expect(res.body.message).toBe('Product not found'); // Check for the specific error message
        });
    });

    describe('PUT /api/products/id/:id', () => {
        it('should update product by id', async () => {
            // Create a product to update later
            const createRes = await request(app)
                .post('/api/products/create-product')
                .send({ name: 'Test Product', price: 100, description: 'A test product' });
        
            // Ensure the product was created successfully
            expect(createRes.statusCode).toBe(201);
            
            // Update the product by id
            const productId = createRes.body.data[0].id
            const res = await request(app)
                .put(`/api/products/update/${productId}`) // Use the correct id from the creation response
                .send({ name: 'Updated Product' });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.IsSuccessful).toBe(true); // Check for success in the response
            expect(res.body.data).toBeDefined(); // Ensure the data is present
            expect(res.body.data.name).toBe('Updated Product'); // Verify the updated name
        });
      
        it('should return 404 if product not found', async () => {
            const res = await request(app)
                .put('/api/products/update/999') // Use a non-existent id
                .send({ name: 'Nonexistent Product' });
        
            expect(res.statusCode).toBe(404);
            expect(res.body.IsSuccessful).toBe(false); // Ensure the response indicates failure
            expect(res.body.message).toBe('Product not found'); // Check for the specific error message
        });
    });

    describe('PUT /api/products', () => {
        it('should update product by name', async () => {
            // Create a product to update later
            const createRes = await request(app)
                .post('/api/products/create-product')
                .send({ name: 'Test Product', price: 100, description: 'A test product' });
        
            // Ensure the product was created successfully
            expect(createRes.statusCode).toBe(201);
        
            // Update the product by name
            const res = await request(app)
                .put('/api/products/update')
                .query({ oldName: 'Test Product' }) // Pass the old name as a query parameter
                .send({ name: 'Updated Product' });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.IsSuccessful).toBe(true); // Check for success in the response
            expect(res.body.data).toBeDefined(); // Ensure the data is present
            expect(res.body.data.name).toBe('Updated Product'); // Verify the updated name
        });
      
        it('should return 404 if product not found', async () => {
          const res = await request(app)
            .put('/api/products/update')
            .query({ oldName: 'Nonexistent Product' }) // Use a non-existent old name
            .send({ name: 'Updated Product' });
      
          expect(res.statusCode).toBe(404);
          expect(res.body.IsSuccessful).toBe(false); // Ensure the response indicates failure
          expect(res.body.message).toBe('Product not found'); // Check for the specific error message
        });
    });
    
    describe('GET /api/products', () => {
        it('should retrieve all products', async () => {
          // Create some products to retrieve
            await request(app)
                .post('/api/products/create-product')
                .send({ name: 'Test Product 1', price: 100, description: 'First test product' });
                
            await request(app)
                .post('/api/products/create-product')
                .send({ name: 'Test Product 2', price: 200, description: 'Second test product' });
        
            // Retrieve all products
            const res = await request(app)
                .get('/api/products/all-products');
        
            expect(res.statusCode).toBe(200); // Expect a successful response
            expect(res.body.IsSuccessful).toBe(true); // Ensure the response indicates success
            expect(res.body.data).toBeInstanceOf(Array); // Check that the data is an array
            expect(res.body.data.length).toBe(2); // Expect 2 products to be returned
            expect(res.body.data[0]).toHaveProperty('id'); // Check that products have an id
            expect(res.body.data[0]).toHaveProperty('name', 'Test Product 1'); // Validate product details
            expect(res.body.data[1]).toHaveProperty('name', 'Test Product 2'); // Validate product details
        });
      
        it('should return an empty array if no products exist', async () => {
            // Ensure the database is clear before checking
            await request(app).delete('/api/products/delete').query({ name: 'Test Product 1' });
            await request(app).delete('/api/products/delete').query({ name: 'Test Product 2' });
        
            // Retrieve all products when none exist
            const res = await request(app)
                .get('/api/products/all-products');
        
            expect(res.statusCode).toBe(200); // Expect a successful response
            expect(res.body.IsSuccessful).toBe(true); // Ensure the response indicates success
            expect(res.body.data).toBeInstanceOf(Array); // Check that the data is an array
            expect(res.body.data.length).toBe(0); // Expect an empty array when no products exist
        });
    }); 

    describe('DELETE /api/products/id/:id', () => {
        it('should delete product by id', async () => {
            // Create a product to delete
            const createRes = await request(app)
                .post('/api/products/create-product')
                .send({ name: 'Test Product', price: 100, description: 'A test product' });
        
            // Ensure the product was created successfully
            expect(createRes.statusCode).toBe(201);
        
            // Delete the product by id
            const productId = createRes.body.data[0].id;
            const res = await request(app)
                .delete(`/api/products/delete/${productId}`);
            
            expect(res.statusCode).toBe(200); // Expect no content for successful deletion
        
            // Verify that the product was deleted
            const checkRes = await request(app)
                .get(`/api/products/id/${productId}`);
            
            expect(checkRes.statusCode).toBe(404); // Expect 404 for a deleted product
            expect(checkRes.body.IsSuccessful).toBe(false); // Ensure the response indicates failure
            expect(checkRes.body.message).toBe('Product not found'); // Check for the specific error message
        });
      
        it('should return 404 if product not found', async () => {
          const res = await request(app)
            .delete('/api/products/delete/999'); // Attempting to delete a non-existent product
          
          expect(res.statusCode).toBe(404); // Expect 404 for a non-existent product
          expect(res.body.IsSuccessful).toBe(false); // Ensure the response indicates failure
          expect(res.body.message).toBe('Product not found'); // Check for the specific error message
        });
    });

    describe('DELETE /api/products', () => {
        it('should delete product by name', async () => {
          // Create a product to delete
          const createRes = await request(app)
            .post('/api/products/create-product')
            .send({ name: 'Test Product', price: 100, description: 'A test product' });
      
          // Ensure the product was created successfully
          expect(createRes.statusCode).toBe(201);
      
          // Delete the product by name
          const res = await request(app)
            .delete('/api/products/delete')
            .query({ name: 'Test Product' });
      
          expect(res.statusCode).toBe(200); // Expect no content for successful deletion
      
          // Verify that the product was deleted
          const checkRes = await request(app)
            .get('/api/products/name')
            .query({ name: 'Test Product' });
      
          expect(checkRes.statusCode).toBe(404); // Expect 404 for a deleted product
          expect(checkRes.body.IsSuccessful).toBe(false); // Ensure the response indicates failure
          expect(checkRes.body.message).toBe('Product not found'); // Check for the specific error message
        });
      
        it('should return 404 if product not found', async () => {
          const res = await request(app)
            .delete('/api/products/delete')
            .query({ name: 'Nonexistent Product' }); // Attempting to delete a non-existent product
          
          expect(res.statusCode).toBe(404); // Expect 404 for a non-existent product
          expect(res.body.IsSuccessful).toBe(false); // Ensure the response indicates failure
          expect(res.body.message).toBe('Product not found'); // Check for the specific error message
        });
    }); 
});
