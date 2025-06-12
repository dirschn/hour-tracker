require 'swagger_helper'

RSpec.describe 'Authentication', type: :request do
  path '/sign_in' do
    post('sign in user') do
      tags 'Authentication'
      description 'Authenticate user and create session'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user_credentials, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              email: { type: :string, example: 'user@example.com' },
              password: { type: :string, example: 'password123' }
            },
            required: ['email', 'password']
          }
        },
        required: ['user']
      }

      response(200, 'successful authentication') do
        schema '$ref': '#/components/schemas/LoginResponse'

        let(:user_credentials) { { user: { email: 'test@example.com', password: 'password123' } } }

        before do
          # Create a test user for authentication
          User.create!(
            email: 'test@example.com',
            password: 'password123',
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser'
          )
        end

        run_test!
      end

      response(401, 'invalid credentials') do
        schema type: :object,
          properties: {
            errors: {
              type: :array,
              items: { type: :string },
              example: ['Invalid email or password']
            }
          }

        let(:user_credentials) { { user: { email: 'wrong@example.com', password: 'wrongpassword' } } }
        run_test!
      end
    end
  end

  path '/sign_out' do
    delete('sign out user') do
      tags 'Authentication'
      description 'Destroy user session'
      produces 'application/json'

      response(200, 'successful logout') do
        schema type: :object,
          properties: {
            message: { type: :string, example: 'Logged out successfully' }
          }

        run_test!
      end
    end
  end
end
