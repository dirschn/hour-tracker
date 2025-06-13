require 'swagger_helper'

RSpec.describe 'employments', type: :request do
  path '/employments' do
    get('list employments') do
      tags 'Employments'
      description 'Retrieve all employments'
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

    post('create employment') do
      tags 'Employments'
      description 'Create a new employment'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :employment, in: :body, schema: {
        type: :object,
        properties: {
          employment: {
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
        required: ['employment']
      }

      response(201, 'employment created') do
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

        let(:employment) { { employment: { user_id: 1, position_id: 1, start_date: '2024-01-01' } } }
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

        let(:employment) { { employment: { user_id: nil, position_id: nil, start_date: '' } } }
        run_test!
      end
    end
  end

  path '/employments/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'employment id'

    get('show employment') do
      tags 'Employments'
      description 'Retrieve a specific employment'
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

      response(404, 'employment not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Employment not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update employment') do
      tags 'Employments'
      description 'Update a employment'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :employment, in: :body, schema: {
        type: :object,
        properties: {
          employment: {
            type: :object,
            properties: {
              start_date: { type: :string, format: 'date', example: '2024-02-01' },
              end_date: { type: :string, format: 'date', example: '2024-11-30', nullable: true }
            }
          }
        },
        required: ['employment']
      }

      response(200, 'employment updated') do
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
        let(:employment) { { employment: { start_date: '2024-02-01', end_date: '2024-11-30' } } }
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
        let(:employment) { { employment: { start_date: 'invalid-date' } } }
        run_test!
      end

      response(404, 'employment not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Employment not found' }
          }

        let(:id) { 'invalid' }
        let(:employment) { { employment: { start_date: '2024-02-01' } } }
        run_test!
      end
    end

    put('update employment') do
      tags 'Employments'
      description 'Update a employment (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :employment, in: :body, schema: {
        type: :object,
        properties: {
          employment: {
            type: :object,
            properties: {
              start_date: { type: :string, format: 'date', example: '2024-02-01' },
              end_date: { type: :string, format: 'date', example: '2024-11-30', nullable: true }
            }
          }
        },
        required: ['employment']
      }

      response(200, 'employment updated') do
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
        let(:employment) { { employment: { start_date: '2024-02-01', end_date: '2024-11-30' } } }
        run_test!
      end
    end

    delete('delete employment') do
      tags 'Employments'
      description 'Delete a employment'

      response(204, 'employment deleted') do
        let(:id) { '1' }
        run_test!
      end

      response(404, 'employment not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Employment not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
