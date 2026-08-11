/**
 * GraphQL Schema Tests
 * Testing GraphQL schema definitions, resolvers, and type system
 */

import { buildSchema, graphql } from 'graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { resolvers } from '../../src/api/graphql/resolvers';
import { typeDefs } from '../../src/api/graphql/schema';

describe('GraphQLSchema', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    schema = buildSchema(typeDefs);
  });

  describe('Schema Validation', () => {
    it('should have valid Query type', () => {
      const queryType = schema.getQueryType();
      expect(queryType).toBeDefined();
      expect(queryType?.name).toBe('Query');
    });

    it('should have valid Mutation type', () => {
      const mutationType = schema.getMutationType();
      expect(mutationType).toBeDefined();
      expect(mutationType?.name).toBe('Mutation');
    });

    it('should have valid Subscription type', () => {
      const subscriptionType = schema.getSubscriptionType();
      expect(subscriptionType).toBeDefined();
      expect(subscriptionType?.name).toBe('Subscription');
    });
  });

  describe('Query Resolvers', () => {
    it('should resolve user query', async () => {
      const query = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            username
            email
            createdAt
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query,
        variableValues: { id: '1' },
        rootValue: resolvers.Query
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.user).toBeDefined();
    });

    it('should resolve users list query', async () => {
      const query = `
        query GetUsers($limit: Int, $offset: Int) {
          users(limit: $limit, offset: $offset) {
            id
            username
            email
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query,
        variableValues: { limit: 10, offset: 0 },
        rootValue: resolvers.Query
      });

      expect(result.errors).toBeUndefined();
      expect(Array.isArray(result.data?.users)).toBe(true);
    });

    it('should resolve post query', async () => {
      const query = `
        query GetPost($id: ID!) {
          post(id: $id) {
            id
            title
            content
            author {
              id
              username
            }
            createdAt
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query,
        variableValues: { id: '1' },
        rootValue: resolvers.Query
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.post).toBeDefined();
    });

    it('should resolve template query', async () => {
      const query = `
        query GetTemplate($id: ID!) {
          template(id: $id) {
            id
            name
            description
            category
            author {
              id
              username
            }
            cells {
              id
              type
              value
            }
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query,
        variableValues: { id: '1' },
        rootValue: resolvers.Query
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.template).toBeDefined();
    });

    it('should handle query errors gracefully', async () => {
      const query = `
        query GetInvalidUser($id: ID!) {
          user(id: $id) {
            id
            invalidField
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query,
        variableValues: { id: 'invalid' },
        rootValue: resolvers.Query
      });

      expect(result.errors).toBeDefined();
    });
  });

  describe('Mutation Resolvers', () => {
    it('should create new user', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            username
            email
            createdAt
          }
        }
      `;

      const variables = {
        input: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        }
      };

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: variables,
        rootValue: resolvers.Mutation
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.createUser).toBeDefined();
    });

    it('should update existing user', async () => {
      const mutation = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            username
            email
            updatedAt
          }
        }
      `;

      const variables = {
        id: '1',
        input: {
          username: 'updateduser',
          email: 'updated@example.com'
        }
      };

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: variables,
        rootValue: resolvers.Mutation
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.updateUser).toBeDefined();
    });

    it('should delete user', async () => {
      const mutation = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id) {
            id
            username
            deletedAt
          }
        }
      `;

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: { id: '1' },
        rootValue: resolvers.Mutation
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.deleteUser).toBeDefined();
    });

    it('should create new post', async () => {
      const mutation = `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            id
            title
            content
            author {
              id
              username
            }
            createdAt
          }
        }
      `;

      const variables = {
        input: {
          title: 'Test Post',
          content: 'Test content',
          authorId: '1'
        }
      };

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: variables,
        rootValue: resolvers.Mutation
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.createPost).toBeDefined();
    });

    it('should create new template', async () => {
      const mutation = `
        mutation CreateTemplate($input: CreateTemplateInput!) {
          createTemplate(input: $input) {
            id
            name
            description
            category
            author {
              id
              username
            }
            createdAt
          }
        }
      `;

      const variables = {
        input: {
          name: 'Test Template',
          description: 'Test description',
          category: 'basic',
          authorId: '1',
          cells: [
            { type: 'data', value: 'test' },
            { type: 'formula', value: '=SUM(A1:A10)' }
          ]
        }
      };

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: variables,
        rootValue: resolvers.Mutation
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.createTemplate).toBeDefined();
    });

    it('should handle mutation errors gracefully', async () => {
      const mutation = `
        mutation CreateInvalidUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            username
          }
        }
      `;

      const variables = {
        input: {
          username: '',
          email: 'invalid-email',
          password: '123'
        }
      };

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: variables,
        rootValue: resolvers.Mutation
      });

      expect(result.errors).toBeDefined();
    });
  });

  describe('Subscription Resolvers', () => {
    it('should subscribe to user updates', async () => {
      const subscription = `
        subscription OnUserUpdated($userId: ID!) {
          userUpdated(userId: $userId) {
            id
            username
            email
            updatedAt
          }
        }
      `;

      const result = await graphql({
        schema,
        source: subscription,
        variableValues: { userId: '1' },
        rootValue: resolvers.Subscription
      });

      expect(result.errors).toBeUndefined();
    });

    it('should subscribe to post creations', async () => {
      const subscription = `
        subscription OnPostCreated {
          postCreated {
            id
            title
            content
            author {
              id
              username
            }
            createdAt
          }
        }
      `;

      const result = await graphql({
        schema,
        source: subscription,
        rootValue: resolvers.Subscription
      });

      expect(result.errors).toBeUndefined();
    });

    it('should subscribe to template updates', async () => {
      const subscription = `
        subscription OnTemplateUpdated($templateId: ID!) {
          templateUpdated(templateId: $templateId) {
            id
            name
            description
            updatedAt
          }
        }
      `;

      const result = await graphql({
        schema,
        source: subscription,
        variableValues: { templateId: '1' },
        rootValue: resolvers.Subscription
      });

      expect(result.errors).toBeUndefined();
    });
  });

  describe('Type Definitions', () => {
    it('should define User type correctly', () => {
      const userType = schema.getType('User');
      expect(userType).toBeDefined();

      const fields = (userType as GraphQLObjectType).getFields();
      expect(fields.id).toBeDefined();
      expect(fields.username).toBeDefined();
      expect(fields.email).toBeDefined();
      expect(fields.createdAt).toBeDefined();
    });

    it('should define Post type correctly', () => {
      const postType = schema.getType('Post');
      expect(postType).toBeDefined();

      const fields = (postType as GraphQLObjectType).getFields();
      expect(fields.id).toBeDefined();
      expect(fields.title).toBeDefined();
      expect(fields.content).toBeDefined();
      expect(fields.author).toBeDefined();
      expect(fields.replies).toBeDefined();
    });

    it('should define Template type correctly', () => {
      const templateType = schema.getType('Template');
      expect(templateType).toBeDefined();

      const fields = (templateType as GraphQLObjectType).getFields();
      expect(fields.id).toBeDefined();
      expect(fields.name).toBeDefined();
      expect(fields.description).toBeDefined();
      expect(fields.category).toBeDefined();
      expect(fields.cells).toBeDefined();
    });

    it('should define Cell type correctly', () => {
      const cellType = schema.getType('Cell');
      expect(cellType).toBeDefined();

      const fields = (cellType as GraphQLObjectType).getFields();
      expect(fields.id).toBeDefined();
      expect(fields.type).toBeDefined();
      expect(fields.value).toBeDefined();
    });
  });

  describe('Input Types', () => {
    it('should define CreateUserInput type', () => {
      const inputType = schema.getType('CreateUserInput');
      expect(inputType).toBeDefined();

      const fields = (inputType as GraphQLObjectType).getFields();
      expect(fields.username).toBeDefined();
      expect(fields.email).toBeDefined();
      expect(fields.password).toBeDefined();
    });

    it('should define CreatePostInput type', () => {
      const inputType = schema.getType('CreatePostInput');
      expect(inputType).toBeDefined();

      const fields = (inputType as GraphQLObjectType).getFields();
      expect(fields.title).toBeDefined();
      expect(fields.content).toBeDefined();
      expect(fields.authorId).toBeDefined();
    });

    it('should define CreateTemplateInput type', () => {
      const inputType = schema.getType('CreateTemplateInput');
      expect(inputType).toBeDefined();

      const fields = (inputType as GraphQLObjectType).getFields();
      expect(fields.name).toBeDefined();
      expect(fields.description).toBeDefined();
      expect(fields.category).toBeDefined();
      expect(fields.cells).toBeDefined();
    });
  });

  describe('Enums', () => {
    it('should define CellType enum', () => {
      const enumType = schema.getType('CellType');
      expect(enumType).toBeDefined();
    });

    it('should define TemplateCategory enum', () => {
      const enumType = schema.getType('TemplateCategory');
      expect(enumType).toBeDefined();
    });
  });

  describe('Interfaces', () => {
    it('should define Node interface', () => {
      const interfaceType = schema.getType('Node');
      expect(interfaceType).toBeDefined();
    });

    it('should implement Node interface on User type', () => {
      const userType = schema.getType('User') as GraphQLObjectType;
      const interfaces = userType.getInterfaces();

      expect(interfaces.some(i => i.name === 'Node')).toBe(true);
    });

    it('should implement Node interface on Post type', () => {
      const postType = schema.getType('Post') as GraphQLObjectType;
      const interfaces = postType.getInterfaces();

      expect(interfaces.some(i => i.name === 'Node')).toBe(true);
    });
  });

  describe('Directives', () => {
    it('should support @auth directive', () => {
      const directive = schema.getDirective('auth');
      expect(directive).toBeDefined();
    });

    it('should support @rateLimit directive', () => {
      const directive = schema.getDirective('rateLimit');
      expect(directive).toBeDefined();
    });

    it('should support @cache directive', () => {
      const directive = schema.getDirective('cache');
      expect(directive).toBeDefined();
    });
  });

  describe('Query Complexity', () => {
    it('should calculate query complexity', () => {
      const query = `
        query GetComplex($id: ID!) {
          user(id: $id) {
            id
            username
            posts {
              id
              title
              replies {
                id
                content
                author {
                  id
                  username
                }
              }
            }
          }
        }
      `;

      const complexity = calculateComplexity(query, schema);
      expect(complexity).toBeGreaterThan(0);
    });

    it('should reject overly complex queries', async () => {
      const query = `
        query GetTooComplex {
          users {
            posts {
              replies {
                author {
                  posts {
                    replies {
                      author {
                        posts {
                          replies {
                            author {
                              id
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query,
        rootValue: resolvers.Query
      });

      expect(result.errors).toBeDefined();
    });
  });

  describe('Introspection', () => {
    it('should support introspection query', async () => {
      const query = `
        {
          __schema {
            types {
              name
              kind
            }
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.__schema).toBeDefined();
    });

    it('should support type introspection', async () => {
      const query = `
        {
          __type(name: "User") {
            name
            kind
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.__type).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid GraphQL syntax', async () => {
      const query = `
        query Invalid {
          user(id: 1) {
            id
          }
        }
      `;

      const result = await graphql({
        schema,
        source: query
      });

      expect(result.errors).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `;

      const variables = {
        input: {
          email: 'test@example.com'
          // Missing required fields
        }
      };

      const result = await graphql({
        schema,
        source: mutation,
        variableValues: variables,
        rootValue: resolvers.Mutation
      });

      expect(result.errors).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should execute simple query quickly', async () => {
      const query = `
        query {
          user(id: "1") {
            id
            username
          }
        }
      `;

      const start = performance.now();

      const result = await graphql({
        schema,
        source: query,
        rootValue: resolvers.Query
      });

      const duration = performance.now() - start;

      expect(result.errors).toBeUndefined();
      expect(duration).toBeLessThan(100);
    });

    it('should handle parallel queries efficiently', async () => {
      const queries = [
        graphql({ schema, source: '{ user(id: "1") { id username } }', rootValue: resolvers.Query }),
        graphql({ schema, source: '{ user(id: "2") { id username } }', rootValue: resolvers.Query }),
        graphql({ schema, source: '{ user(id: "3") { id username } }', rootValue: resolvers.Query })
      ];

      const start = performance.now();

      const results = await Promise.all(queries);

      const duration = performance.now() - start;

      results.forEach(result => {
        expect(result.errors).toBeUndefined();
      });

      expect(duration).toBeLessThan(200);
    });
  });
});

function calculateComplexity(query: string, schema: GraphQLSchema): number {
  // Simplified complexity calculation
  const depth = (query.match(/\{/g) || []).length;
  return depth * 10;
}
