const ProductService = require('../services/productService');
const responseModel = require('../responseModel');

class ProductController {
    static async createProduct(req, res, next) {
        try {
            const productData = req.body;
            const name = req.body.name;
            if (!name) {
                return res.status(400).json(responseModel(false, 'Product name is required'));
            }
            const product = await ProductService.createProduct(productData);
            res.status(201).json(responseModel(true, 'Product created successfully', [product]));
        } catch (error) {
          // If error message matches, send a specific response
          if (error.message === 'Product with this name already exists.') {
            return res.status(400).json(responseModel(false, error.message));
          }
          next(error); // For other errors, let the error handler handle it
        }
    }

    static async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      if (!product) {
        return res.status(404).json(responseModel(false, 'Product not found'));
      }
      res.json(responseModel(true, 'Product retrieved successfully', product));
    } catch (error) {
      next(error);
    }
  }

  static async getProductByName(req, res, next) {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json(responseModel(false, 'Product name is required'));
      }
      const product = await ProductService.getProductByName(name);
      if (!product) {
        return res.status(404).json(responseModel(false, 'Product not found'));
      }
      res.json(responseModel(true, 'Product retrieved successfully', product));
    } catch (error) {
      next(error);
    }
  }

  static async updateProductById(req, res, next) {
    try {
      const { id } = req.params;
      const { name, price, description } = req.body;
      if (!name) {
        return res.status(400).json(responseModel(false, 'New product name is required'));
      }
      const product = await ProductService.updateProductById(id, name, price, description);
      if (!product) {
        return res.status(404).json(responseModel(false, 'Product not found'));
      }
      res.json(responseModel(true, 'Product updated successfully', product));
    } catch (error) {
      next(error);
    }
  }

  static async updateProductByName(req, res, next) {
    try {
      const { oldName } = req.query;
      const { name, price, description } = req.body; 
      if (!oldName || !name) {
        return res.status(400).json(responseModel(false, 'Both old and new product names are required'));
      }
      const product = await ProductService.updateProductByName(oldName, name, price, description);
      if (!product) {
        return res.status(404).json(responseModel(false, 'Product not found'));
      }
      res.json(responseModel(true, 'Product updated successfully', product));
    } catch (error) {
      next(error);
    }
  }

  static async deleteProductById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProductById(id);
      if (!result) {
        return res.status(404).json(responseModel(false, 'Product not found'));
      }
      res.status(204).json(responseModel(true, 'Product deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteProductByName(req, res, next) {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json(responseModel(false, 'Product name is required'));
      }
      const result = await ProductService.deleteProductByName(name);
      if (!result) {
        return res.status(404).json(responseModel(false, 'Product not found'));
      }
      res.status(204).json(responseModel(true, 'Product deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

    static async getAllProducts(req, res, next) {
        try {
            const products = await ProductService.getAllProducts();

            // Check if products array is empty
            if (!products || products.length === 0) {
                return res.status(200).json(responseModel(true, 'No products available', [])); // Return empty array if no products
            }

            return res.status(200).json(responseModel(true, 'Products retrieved successfully', products));
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductController;
