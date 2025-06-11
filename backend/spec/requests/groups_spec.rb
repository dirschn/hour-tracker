require 'swagger_helper'

RSpec.describe 'groups', type: :request do
  path '/groups' do
    get('list groups') do
      tags 'Groups'
      description 'Retrieve all groups'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: 'Development Team' },
              user_id: { type: :integer, example: 1 },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'name', 'user_id']
          }

        run_test!
      end
    end

    post('create group') do
      tags 'Groups'
      description 'Create a new group'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :group, in: :body, schema: {
        type: :object,
        properties: {
          group: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Development Team' },
              user_id: { type: :integer, example: 1 }
            },
            required: ['name', 'user_id']
          }
        },
        required: ['group']
      }

      response(201, 'group created') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            name: { type: :string, example: 'Development Team' },
            user_id: { type: :integer, example: 1 },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:group) { { group: { name: 'Development Team', user_id: 1 } } }
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

        let(:group) { { group: { name: '', user_id: nil } } }
        run_test!
      end
    end
  end

  path '/groups/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'group id'

    get('show group') do
      tags 'Groups'
      description 'Retrieve a specific group'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            name: { type: :string, example: 'Development Team' },
            user_id: { type: :integer, example: 1 },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        run_test!
      end

      response(404, 'group not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Group not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update group') do
      tags 'Groups'
      description 'Update a group'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :group, in: :body, schema: {
        type: :object,
        properties: {
          group: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Updated Team' }
            }
          }
        },
        required: ['group']
      }

      response(200, 'group updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            name: { type: :string, example: 'Updated Team' },
            user_id: { type: :integer, example: 1 },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:group) { { group: { name: 'Updated Team' } } }
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
        let(:group) { { group: { name: '' } } }
        run_test!
      end

      response(404, 'group not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Group not found' }
          }

        let(:id) { 'invalid' }
        let(:group) { { group: { name: 'Updated Team' } } }
        run_test!
      end
    end

    put('update group') do
      tags 'Groups'
      description 'Update a group (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :group, in: :body, schema: {
        type: :object,
        properties: {
          group: {
            type: :object,
            properties: {
              name: { type: :string, example: 'Updated Team' }
            }
          }
        },
        required: ['group']
      }

      response(200, 'group updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            name: { type: :string, example: 'Updated Team' },
            user_id: { type: :integer, example: 1 },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:group) { { group: { name: 'Updated Team' } } }
        run_test!
      end
    end

    delete('delete group') do
      tags 'Groups'
      description 'Delete a group'

      response(204, 'group deleted') do
        let(:id) { '1' }
        run_test!
      end

      response(404, 'group not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Group not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
