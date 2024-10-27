// src/swagger/swagger.js
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const swaggerRefParser = require('json-schema-ref-parser');
const fs = require('fs');

const loadSwaggerConfig = async (app) => {
  try {
    // Get the absolute path to the swagger directory
    const swaggerPath = path.resolve(__dirname);
    
    // Load and parse the main OpenAPI specification
    const mainSpecPath = path.join(swaggerPath, 'index.yaml');
    
    // First, read and parse all the YAML files
    const schemas = YAML.load(path.join(swaggerPath, './components/schemas.yaml'));
    const responses = YAML.load(path.join(swaggerPath, './components/responses.yaml'));
    const parameters = YAML.load(path.join(swaggerPath, './components/parameters.yaml'));
    
    // Load the main spec
    const swaggerDocument = YAML.load(mainSpecPath);
    
    // Inject the schemas and responses directly
    swaggerDocument.components = {
      schemas: schemas,
      responses: responses
    };
    
    // Configure Swagger UI options
    const swaggerOptions = {
      explorer: true,
      customSiteTitle: "Library Management API Documentation",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
      }
    };

    // Set up the Swagger UI route
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, swaggerOptions)
    );

    console.log('Swagger documentation initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Swagger documentation:', error);
    throw error;
  }
};

module.exports = loadSwaggerConfig;