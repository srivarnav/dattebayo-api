import swaggerJsdoc from 'swagger-jsdoc';
import { collectionNames } from '../interfaces/interfaces';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dattebayo API',
      version: '1.0.0',
      description: 'A Naruto-themed REST API providing information about characters, clans, villages, and more from the Naruto universe.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
      {
        url: 'https://dattebayo-api.onrender.com',
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Characters', description: 'Naruto characters endpoints' },
      { name: 'Akatsuki', description: 'Akatsuki organization members' },
      { name: 'Clans', description: 'Ninja clans information' },
      { name: 'Kara', description: 'Kara organization members' },
      { name: 'Kekkei Genkai', description: 'Kekkei Genkai abilities' },
      { name: 'Tailed Beasts', description: 'Tailed Beasts information' },
      { name: 'Teams', description: 'Ninja teams information' },
      { name: 'Villages', description: 'Hidden villages information' },
    ],
    paths: generatePaths(),
  },
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

function generatePaths() {
  const paths: any = {};
  
  // Map collection names to their display names
  const collectionNameMap: { [key: string]: string } = {
    'characters': 'Characters',
    'akatsuki': 'Akatsuki',
    'clans': 'Clans',
    'kara': 'Kara',
    'kekkei-genkai': 'Kekkei Genkai',
    'tailed-beasts': 'Tailed Beasts',
    'teams': 'Teams',
    'villages': 'Villages',
  };
  
  collectionNames.forEach((collection: string) => {
    const collectionName = collectionNameMap[collection] || collection.charAt(0).toUpperCase() + collection.slice(1);
    
    paths[`/${collection}`] = {
      get: {
        tags: [collectionName],
        summary: `Get all ${collection}`,
        description: `Retrieve a paginated list of ${collection} with optional name filtering`,
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'integer',
              default: 1,
              minimum: 1,
            },
            description: 'Page number for pagination',
          },
          {
            in: 'query',
            name: 'limit',
            schema: {
              type: 'integer',
              default: 20,
              minimum: 1,
              maximum: 100,
            },
            description: 'Number of items per page',
          },
          {
            in: 'query',
            name: 'name',
            schema: {
              type: 'string',
            },
            description: 'Filter by name (case-insensitive partial match)',
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    [collection]: {
                      type: 'array',
                      items: {
                        type: 'object',
                      },
                    },
                    currentPage: {
                      type: 'integer',
                      example: 1,
                    },
                    pageSize: {
                      type: 'integer',
                      example: 20,
                    },
                    total: {
                      type: 'integer',
                      example: 100,
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    paths[`/${collection}/{ids}`] = {
      get: {
        tags: [collectionName],
        summary: `Get ${collection} by ID(s)`,
        description: `Retrieve one or more ${collection} by their ID(s). Multiple IDs can be provided as comma-separated values.`,
        parameters: [
          {
            in: 'path',
            name: 'ids',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Single ID or comma-separated list of IDs (e.g., "1" or "1,2,3")',
            example: '1',
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      type: 'object',
                      description: 'Single item response',
                    },
                    {
                      type: 'array',
                      items: {
                        type: 'object',
                      },
                      description: 'Multiple items response',
                    },
                  ],
                },
              },
            },
          },
          '400': {
            description: 'Bad request - At least one ID is required',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: 'At least one id is required',
                },
              },
            },
          },
          '404': {
            description: 'Not found - Item(s) with the provided ID(s) not found',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: `${collection} with ids '1,2' not found`,
                },
              },
            },
          },
        },
      },
    };
  });

  return paths;
}

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;

