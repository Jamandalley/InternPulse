const express = require('express');
const ProductController = require('../controllers/productController');

const router = express.Router();

router.post('/create-product', ProductController.createProduct);
router.get('/all-products', ProductController.getAllProducts);
router.get('/id/:id', ProductController.getProductById);
router.get('/name', ProductController.getProductByName);
router.put('/update/:id', ProductController.updateProductById);
router.put('/update', ProductController.updateProductByName);
router.delete('/delete/:id', ProductController.deleteProductById);
router.delete('/delete', ProductController.deleteProductByName);

module.exports = router;