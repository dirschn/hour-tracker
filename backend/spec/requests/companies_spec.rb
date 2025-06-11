require 'swagger_helper'

RSpec.describe 'companies', type: :request do
  # Define shared schema as a constant
  COMPANY_SCHEMA = {
    type: :object,
    properties: {
      id: { type: :integer, example: 1 },
      name: { type: :string, example: 'Acme Corp' },
      description: { type: :string, example: 'A technology company', nullable: true },
      created_at: { type: :string, format: 'date-time' },
      updated_at: { type: :string, format: 'date-time' }
    },
    required: ['id', 'name']
  }.freeze

  path '/companies' do
    get('list companies') do
      tags 'Companies'
      description 'Retrieve all companies'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array, items: COMPANY_SCHEMA

        run_test!
      end
    end

    post('create company') do
      tags 'Companies'
      description 'Create a new company'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :company, in: :body, schema: {
        type: :object,
        properties: {
          company: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Acme Corp' },
              description: { type: :string, example: 'A technology company', nullable: true }
            },
            required: ['name']
          }
        },
        required: ['company']
      }

      response(201, 'company created') do
        schema COMPANY_SCHEMA

        let(:company) { { company: { name: 'Acme Corp' } } }
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

        let(:company) { { company: { name: '' } } }
        run_test!
      end
    end
  end

  path '/companies/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'company id'

    get('show company') do
      tags 'Companies'
      description 'Retrieve a specific company'
      produces 'application/json'

      response(200, 'successful') do
        schema COMPANY_SCHEMA

        let(:id) { '1' }
        run_test!
      end

      response(404, 'company not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Company not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update company') do
      tags 'Companies'
      description 'Update a company'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :company, in: :body, schema: {
        type: :object,
        properties: {
          company: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Updated Corp' },
              description: { type: :string, example: 'An updated technology company', nullable: true }
            }
          }
        },
        required: ['company']
      }

      response(200, 'company updated') do
        schema COMPANY_SCHEMA

        let(:id) { '1' }
        let(:company) { { company: { name: 'Updated Corp' } } }
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
        let(:company) { { company: { name: '' } } }
        run_test!
      end

      response(404, 'company not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Company not found' }
          }

        let(:id) { 'invalid' }
        let(:company) { { company: { name: 'Updated Corp' } } }
        run_test!
      end
    end

    put('update company') do
      tags 'Companies'
      description 'Update a company (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :company, in: :body, schema: {
        type: :object,
        properties: {
          company: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Updated Corp' },
              description: { type: :string, example: 'An updated technology company', nullable: true }
            }
          }
        },
        required: ['company']
      }

      response(200, 'company updated') do
        schema COMPANY_SCHEMA

        let(:id) { '1' }
        let(:company) { { company: { name: 'Updated Corp' } } }
        run_test!
      end
    end

    delete('delete company') do
      tags 'Companies'
      description 'Delete a company'

      response(204, 'company deleted') do
        let(:id) { '1' }
        run_test!
      end

      response(404, 'company not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Company not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
