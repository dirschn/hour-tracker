require 'swagger_helper'

RSpec.describe 'user_positions', type: :request do
  path '/user_positions' do
    get('list user positions') do
      tags 'User Positions'
      description 'Retrieve all user positions'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              user_id: { type: :integer, example: 1 },
              position_id: { type: :integer, example: 1 },
              start_date: { type: :string, format: 'date', example: '2024-01-01' },
              end_date: { type: :string, format: 'date', example: '2024-12-31', nullable: true },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'user_id', 'position_id', 'start_date']
          }

        run_test!
      end
    end

    post('create user position') do
      tags 'User Positions'
      description 'Create a new user position'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user_position, in: :body, schema: {
        type: :object,
        properties: {
          user_position: {
            type: :object,
            properties: {
              user_id: { type: :integer, example: 1 },
              position_id: { type: :integer, example: 1 },
              start_date: { type: :string, format: 'date', example: '2024-01-01' },
              end_date: { type: :string, format: 'date', example: '2024-12-31', nullable: true }
            },
            required: ['user_id', 'position_id', 'start_date']
          }
        },
        required: ['user_position']
      }

      response(201, 'user position created') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            position_id: { type: :integer, example: 1 },
            start_date: { type: :string, format: 'date', example: '2024-01-01' },
            end_date: { type: :string, format: 'date', example: '2024-12-31', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:user_position) { { user_position: { user_id: 1, position_id: 1, start_date: '2024-01-01' } } }
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

        let(:user_position) { { user_position: { user_id: nil, position_id: nil, start_date: '' } } }
        run_test!
      end
    end
  end

  path '/user_positions/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'user position id'

    get('show user position') do
      tags 'User Positions'
      description 'Retrieve a specific user position'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            position_id: { type: :integer, example: 1 },
            start_date: { type: :string, format: 'date', example: '2024-01-01' },
            end_date: { type: :string, format: 'date', example: '2024-12-31', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        run_test!
      end

      response(404, 'user position not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'User position not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update user position') do
      tags 'User Positions'
      description 'Update a user position'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user_position, in: :body, schema: {
        type: :object,
        properties: {
          user_position: {
            type: :object,
            properties: {
              start_date: { type: :string, format: 'date', example: '2024-02-01' },
              end_date: { type: :string, format: 'date', example: '2024-11-30', nullable: true }
            }
          }
        },
        required: ['user_position']
      }

      response(200, 'user position updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            position_id: { type: :integer, example: 1 },
            start_date: { type: :string, format: 'date', example: '2024-02-01' },
            end_date: { type: :string, format: 'date', example: '2024-11-30', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:user_position) { { user_position: { start_date: '2024-02-01', end_date: '2024-11-30' } } }
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

        let(:id) { '1' }
        let(:user_position) { { user_position: { start_date: 'invalid-date' } } }
        run_test!
      end

      response(404, 'user position not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'User position not found' }
          }

        let(:id) { 'invalid' }
        let(:user_position) { { user_position: { start_date: '2024-02-01' } } }
        run_test!
      end
    end

    put('update user position') do
      tags 'User Positions'
      description 'Update a user position (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user_position, in: :body, schema: {
        type: :object,
        properties: {
          user_position: {
            type: :object,
            properties: {
              start_date: { type: :string, format: 'date', example: '2024-02-01' },
              end_date: { type: :string, format: 'date', example: '2024-11-30', nullable: true }
            }
          }
        },
        required: ['user_position']
      }

      response(200, 'user position updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            position_id: { type: :integer, example: 1 },
            start_date: { type: :string, format: 'date', example: '2024-02-01' },
            end_date: { type: :string, format: 'date', example: '2024-11-30', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:user_position) { { user_position: { start_date: '2024-02-01', end_date: '2024-11-30' } } }
        run_test!
      end
    end

    delete('delete user position') do
      tags 'User Positions'
      description 'Delete a user position'

      response(204, 'user position deleted') do
        let(:id) { '1' }
        run_test!
      end

      response(404, 'user position not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'User position not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
