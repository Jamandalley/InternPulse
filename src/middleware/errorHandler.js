const responseModel = require('../responseModel');

function errorHandler(err, req, res, next) {
    console.error(err.stack);
    
    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json(responseModel(false, 'Product name must be unique'));
    }
    
    res.status(500).json(responseModel(false, 'Internal server error'));
}
  
module.exports = errorHandler;