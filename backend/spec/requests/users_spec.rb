require 'swagger_helper'

RSpec.describe 'users', type: :request do
  # Create a test user for tests that need an existing user
  let!(:test_user) { User.create!(first_name: 'John', last_name: 'Doe', username: 'johndoe', email: 'john.doe@example.com') }

  path '/users' do
    get('list users') do
      tags 'Users'
      description 'Retrieve all users'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              first_name: { type: :string, example: 'John' },
              last_name: { type: :string, example: 'Doe' },
              username: { type: :string, example: 'johndoe' },
              email: { type: :string, example: 'john.doe@example.com' },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'first_name', 'last_name', 'username', 'email']
          }

        run_test!
      end
    end

    post('create user') do
      tags 'Users'
      description 'Create a new user'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              first_name: { type: :string, example: 'John' },
              last_name: { type: :string, example: 'Doe' },
              username: { type: :string, example: 'johndoe' },
              email: { type: :string, example: 'john.doe@example.com' }
            },
            required: ['first_name', 'last_name', 'username', 'email']
          }
        },
        required: ['user']
      }

      response(201, 'user created') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            first_name: { type: :string, example: 'John' },
            last_name: { type: :string, example: 'Doe' },
            username: { type: :string, example: 'johndoe' },
            email: { type: :string, example: 'john.doe@example.com' },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:user) { { user: { first_name: 'Jane', last_name: 'Smith', username: 'janesmith', email: 'jane.smith@example.com' } } }
        run_test!
      end

      response(422, 'invalid request') do
        schema type: :object,
          properties: {
            errors: {
              type: :object,
              additionalProperties: {
                type: :array,
                items: { type: :string }
              }
            }
          }

        let(:user) { { user: { first_name: '', last_name: '', username: '', email: 'invalid-email' } } }
        run_test!
      end
    end
  end

  path '/users/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'user id'

    get('show user') do
      tags 'Users'
      description 'Retrieve a specific user'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            first_name: { type: :string, example: 'John' },
            last_name: { type: :string, example: 'Doe' },
            username: { type: :string, example: 'johndoe' },
            email: { type: :string, example: 'john.doe@example.com' },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { test_user.id }
        run_test!
      end

      response(404, 'user not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'User not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update user') do
      tags 'Users'
      description 'Update a user'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              first_name: { type: :string, example: 'Jane' },
              last_name: { type: :string, example: 'Smith' },
              username: { type: :string, example: 'janesmith' },
              email: { type: :string, example: 'jane.smith@example.com' }
            }
          }
        },
        required: ['user']
      }

      response(200, 'user updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            first_name: { type: :string, example: 'Jane' },
            last_name: { type: :string, example: 'Smith' },
            username: { type: :string, example: 'janesmith' },
            email: { type: :string, example: 'jane.smith@example.com' },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { test_user.id }
        let(:user) { { user: { first_name: 'Jane', last_name: 'Smith', username: 'janesmith', email: 'jane.smith@example.com' } } }
        run_test!
      end

      response(422, 'invalid request') do
        schema type: :object,
          properties: {
            errors: {
              type: :object,
              additionalProperties: {
                type: :array,
                items: { type: :string }
              }
            }
          }

        let(:id) { test_user.id }
        let(:user) { { user: { first_name: '', last_name: '', username: '', email: 'invalid-email' } } }
        run_test!
      end

      response(404, 'user not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'User not found' }
          }

        let(:id) { 'invalid' }
        let(:user) { { user: { first_name: 'Jane', last_name: 'Smith', username: 'janesmith', email: 'jane.smith@example.com' } } }
        run_test!
      end
    end

    put('update user') do
      tags 'Users'
      description 'Update a user (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              first_name: { type: :string, example: 'Jane' },
              last_name: { type: :string, example: 'Smith' },
              username: { type: :string, example: 'janesmith' },
              email: { type: :string, example: 'jane.smith@example.com' }
            }
          }
        },
        required: ['user']
      }

      response(200, 'user updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            first_name: { type: :string, example: 'Jane' },
            last_name: { type: :string, example: 'Smith' },
            username: { type: :string, example: 'janesmith' },
            email: { type: :string, example: 'jane.smith@example.com' },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { test_user.id }
        let(:user) { { user: { first_name: 'Jane', last_name: 'Smith', username: 'janesmith', email: 'jane.smith@example.com' } } }
        run_test!
      end
    end

    delete('delete user') do
      tags 'Users'
      description 'Delete a user'

      response(204, 'user deleted') do
        let(:id) { test_user.id }
        run_test!
      end

      response(404, 'user not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'User not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
