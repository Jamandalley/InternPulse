const db = require('../database/db');

class ProductService {
    // Create a new product with name, price, and description
    static async createProduct({ name, price, description }) {
        // Check if product already exists
        const existingProduct = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM products WHERE name = ?', [name], (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        });
    
        if (existingProduct) {
          throw new Error('Product with this name already exists.');
        }
    
        return new Promise((resolve, reject) => {
          db.run('INSERT INTO products (name, price, description) VALUES (?, ?, ?)', [name, price, description], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, name, price, description });
            }
          });
        });
    }
  
    // Get a product by ID
    static getProductById(id) {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM products WHERE id = ?';
        db.get(sql, [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    }
  
    // Get a product by name
    static getProductByName(name) {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM products WHERE name = ?';
        db.get(sql, [name], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    }
  
    // Update a product's name and price by ID
    static updateProductById(id, name, price, description) {
      return new Promise((resolve, reject) => {
        const sql = 'UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?';
        db.run(sql, [name, price, description, id], function (err) {
          if (err) {
            reject(err);
          } else {
            if (this.changes > 0) {
              resolve({ id, name, price, description });
            } else {
              resolve(null);
            }
          }
        });
      });
    }
  
    // Update a product's name by old name
    static updateProductByName(oldName, newName) {
      return new Promise((resolve, reject) => {
        const sql = 'UPDATE products SET name = ? WHERE name = ?';
        db.run(sql, [newName, oldName], function (err) {
          if (err) {
            reject(err);
          } else {
            if (this.changes > 0) {
              resolve({ name: newName });
            } else {
              resolve(null);
            }
          }
        });
      });
    }
  
    // Delete a product by ID
    static deleteProductById(id) {
      return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM products WHERE id = ?';
        db.run(sql, [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
      });
    }
  
    // Delete a product by name
    static deleteProductByName(name) {
      return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM products WHERE name = ?';
        db.run(sql, [name], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
      });
    }
  
    // New method: Get all products
    static getAllProducts() {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM products';
        db.all(sql, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }
  
module.exports = ProductService;
  