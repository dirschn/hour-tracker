require 'swagger_helper'

RSpec.describe 'hourly_rates', type: :request do
  path '/hourly_rates' do
    get('list hourly rates') do
      tags 'Hourly Rates'
      description 'Retrieve all hourly rates'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              user_position_id: { type: :integer, example: 1 },
              rate_cents: { type: :integer, example: 5000 },
              rate: { type: :string, example: '50.00' },
              effective_date: { type: :string, format: 'date', example: '2024-01-01' },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'user_position_id', 'rate_cents', 'effective_date']
          }

        run_test!
      end
    end

    post('create hourly rate') do
      tags 'Hourly Rates'
      description 'Create a new hourly rate'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :hourly_rate, in: :body, schema: {
        type: :object,
        properties: {
          hourly_rate: {
            type: :object,
            properties: {
              user_position_id: { type: :integer, example: 1 },
              rate_cents: { type: :integer, example: 5000 },
              effective_date: { type: :string, format: 'date', example: '2024-01-01' }
            },
            required: ['user_position_id', 'rate_cents', 'effective_date']
          }
        },
        required: ['hourly_rate']
      }

      response(201, 'hourly rate created') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_position_id: { type: :integer, example: 1 },
            rate_cents: { type: :integer, example: 5000 },
            rate: { type: :string, example: '50.00' },
            effective_date: { type: :string, format: 'date', example: '2024-01-01' },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:hourly_rate) { { hourly_rate: { user_position_id: 1, rate_cents: 5000, effective_date: '2024-01-01' } } }
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

        let(:hourly_rate) { { hourly_rate: { user_position_id: nil, rate_cents: -100, effective_date: '' } } }
        run_test!
      end
    end
  end

  path '/hourly_rates/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'hourly rate id'

    get('show hourly rate') do
      tags 'Hourly Rates'
      description 'Retrieve a specific hourly rate'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_position_id: { type: :integer, example: 1 },
            rate_cents: { type: :integer, example: 5000 },
            rate: { type: :string, example: '50.00' },
            effective_date: { type: :string, format: 'date', example: '2024-01-01' },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        run_test!
      end

      response(404, 'hourly rate not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Hourly rate not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update hourly rate') do
      tags 'Hourly Rates'
      description 'Update an hourly rate'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :hourly_rate, in: :body, schema: {
        type: :object,
        properties: {
          hourly_rate: {
            type: :object,
            properties: {
              rate_cents: { type: :integer, example: 5500 },
              effective_date: { type: :string, format: 'date', example: '2024-06-01' }
            }
          }
        },
        required: ['hourly_rate']
      }

      response(200, 'hourly rate updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_position_id: { type: :integer, example: 1 },
            rate_cents: { type: :integer, example: 5500 },
            rate: { type: :string, example: '55.00' },
            effective_date: { type: :string, format: 'date', example: '2024-06-01' },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:hourly_rate) { { hourly_rate: { rate_cents: 5500, effective_date: '2024-06-01' } } }
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
        let(:hourly_rate) { { hourly_rate: { rate_cents: -100 } } }
        run_test!
      end

      response(404, 'hourly rate not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Hourly rate not found' }
          }

        let(:id) { 'invalid' }
        let(:hourly_rate) { { hourly_rate: { rate_cents: 5500 } } }
        run_test!
      end
    end

    put('update hourly rate') do
      tags 'Hourly Rates'
      description 'Update an hourly rate (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :hourly_rate, in: :body, schema: {
        type: :object,
        properties: {
          hourly_rate: {
            type: :object,
            properties: {
              rate_cents: { type: :integer, example: 5500 },
              effective_date: { type: :string, format: 'date', example: '2024-06-01' }
            }
          }
        },
        required: ['hourly_rate']
      }

      response(200, 'hourly rate updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_position_id: { type: :integer, example: 1 },
            rate_cents: { type: :integer, example: 5500 },
            rate: { type: :string, example: '55.00' },
            effective_date: { type: :string, format: 'date', example: '2024-06-01' },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:hourly_rate) { { hourly_rate: { rate_cents: 5500, effective_date: '2024-06-01' } } }
        run_test!
      end
    end

    delete('delete hourly rate') do
      tags 'Hourly Rates'
      description 'Delete an hourly rate'

      response(204, 'hourly rate deleted') do
        let(:id) { '1' }
        run_test!
      end

      response(404, 'hourly rate not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Hourly rate not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
