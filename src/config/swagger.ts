const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
import express from 'express';
import { envs } from './envs';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend Gestión de envios y logística',
      version: '1.0.0',
      description: 'Realizado por: Israel Trujillo Dominguez',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: !envs.PROD ? ['./src/**/*.ts'] : ['./dist/**/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware de Swagger
export const swaggerMiddleware = (app: express.Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
