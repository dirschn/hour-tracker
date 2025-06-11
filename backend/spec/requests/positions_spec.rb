require 'swagger_helper'

RSpec.describe 'positions', type: :request do
  path '/positions' do
    get('list positions') do
      tags 'Positions'
      description 'Retrieve all positions'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              title: { type: :string, example: 'Software Developer' },
              company_id: { type: :integer, example: 1 },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'title', 'company_id']
          }

        run_test!
      end
    end

    post('create position') do
      tags 'Positions'
      description 'Create a new position'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :position, in: :body, schema: {
        type: :object,
        properties: {
          position: {
            type: :object,
            properties: {
              title: { type: :string, example: 'Software Developer' },
              company_id: { type: :integer, example: 1 }
            },
            required: ['title', 'company_id']
          }
        },
        required: ['position']
      }

      response(201, 'position created') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            title: { type: :string, example: 'Software Developer' },
            company_id: { type: :integer, example: 1 },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:position) { { position: { title: 'Software Developer', company_id: 1 } } }
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

        let(:position) { { position: { title: '', company_id: nil } } }
        run_test!
      end
    end
  end

  path '/positions/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'position id'

    get('show position') do
      tags 'Positions'
      description 'Retrieve a specific position'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            title: { type: :string, example: 'Software Developer' },
            company_id: { type: :integer, example: 1 },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        run_test!
      end

      response(404, 'position not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Position not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update position') do
      tags 'Positions'
      description 'Update a position'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :position, in: :body, schema: {
        type: :object,
        properties: {
          position: {
            type: :object,
            properties: {
              title: { type: :string, example: 'Senior Software Developer' }
            }
          }
        },
        required: ['position']
      }

      response(200, 'position updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            title: { type: :string, example: 'Senior Software Developer' },
            company_id: { type: :integer, example: 1 },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:position) { { position: { title: 'Senior Software Developer' } } }
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
        let(:position) { { position: { title: '' } } }
        run_test!
      end

      response(404, 'position not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Position not found' }
          }

        let(:id) { 'invalid' }
        let(:position) { { position: { title: 'Senior Software Developer' } } }
        run_test!
      end
    end

    put('update position') do
      tags 'Positions'
      description 'Update a position (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :position, in: :body, schema: {
        type: :object,
        properties: {
          position: {
            type: :object,
            properties: {
              title: { type: :string, example: 'Senior Software Developer' }
            }
          }
        },
        required: ['position']
      }

      response(200, 'position updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            title: { type: :string, example: 'Senior Software Developer' },
            company_id: { type: :integer, example: 1 },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:position) { { position: { title: 'Senior Software Developer' } } }
        run_test!
      end
    end

    delete('delete position') do
      tags 'Positions'
      description 'Delete a position'

      response(204, 'position deleted') do
        let(:id) { '1' }
        run_test!
      end

      response(404, 'position not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Position not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
