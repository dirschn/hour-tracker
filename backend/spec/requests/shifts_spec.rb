require 'swagger_helper'

RSpec.describe 'shifts', type: :request do
  path '/shifts' do
    get('list shifts') do
      tags 'Shifts'
      description 'Retrieve all shifts'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              employment_id: { type: :integer, example: 1 },
              user_id: { type: :integer, example: 1 },
              group_id: { type: :integer, example: 1, nullable: true },
              minutes_worked: { type: :integer, example: 480 },
              date: { type: :string, format: 'date', example: '2024-01-15' },
              notes: { type: :string, example: 'Worked on feature development', nullable: true },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'employment_id', 'user_id', 'minutes_worked', 'date']
          }

        run_test!
      end
    end

    post('create shift') do
      tags 'Shifts'
      description 'Create a new shift'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :shift, in: :body, schema: {
        type: :object,
        properties: {
          shift: {
            type: :object,
            properties: {
              employment_id: { type: :integer, example: 1 },
              user_id: { type: :integer, example: 1 },
              group_id: { type: :integer, example: 1, nullable: true },
              minutes_worked: { type: :integer, example: 480 },
              date: { type: :string, format: 'date', example: '2024-01-15' },
              notes: { type: :string, example: 'Worked on feature development', nullable: true }
            },
            required: ['employment_id', 'user_id', 'minutes_worked', 'date']
          }
        },
        required: ['shift']
      }

      response(201, 'shift created') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            employment_id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            group_id: { type: :integer, example: 1, nullable: true },
            minutes_worked: { type: :integer, example: 480 },
            date: { type: :string, format: 'date', example: '2024-01-15' },
            notes: { type: :string, example: 'Worked on feature development', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:shift) { { shift: { employment_id: 1, user_id: 1, minutes_worked: 480, date: '2024-01-15' } } }
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

        let(:shift) { { shift: { employment_id: nil, minutes_worked: 1500, date: '' } } }
        run_test!
      end
    end
  end

  path '/shifts/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'shift id'

    get('show shift') do
      tags 'Shifts'
      description 'Retrieve a specific shift'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            employment_id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            group_id: { type: :integer, example: 1, nullable: true },
            minutes_worked: { type: :integer, example: 480 },
            date: { type: :string, format: 'date', example: '2024-01-15' },
            notes: { type: :string, example: 'Worked on feature development', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        run_test!
      end

      response(404, 'shift not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Shift not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update shift') do
      tags 'Shifts'
      description 'Update a shift'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :shift, in: :body, schema: {
        type: :object,
        properties: {
          shift: {
            type: :object,
            properties: {
              minutes_worked: { type: :integer, example: 520 },
              date: { type: :string, format: 'date', example: '2024-01-16' },
              notes: { type: :string, example: 'Updated work on feature development', nullable: true }
            }
          }
        },
        required: ['shift']
      }

      response(200, 'shift updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            employment_id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            group_id: { type: :integer, example: 1, nullable: true },
            minutes_worked: { type: :integer, example: 520 },
            date: { type: :string, format: 'date', example: '2024-01-16' },
            notes: { type: :string, example: 'Updated work on feature development', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:shift) { { shift: { minutes_worked: 520, date: '2024-01-16', notes: 'Updated work on feature development' } } }
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
        let(:shift) { { shift: { minutes_worked: 1500 } } }
        run_test!
      end

      response(404, 'shift not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Shift not found' }
          }

        let(:id) { 'invalid' }
        let(:shift) { { shift: { minutes_worked: 520 } } }
        run_test!
      end
    end

    put('update shift') do
      tags 'Shifts'
      description 'Update a shift (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :shift, in: :body, schema: {
        type: :object,
        properties: {
          shift: {
            type: :object,
            properties: {
              minutes_worked: { type: :integer, example: 520 },
              date: { type: :string, format: 'date', example: '2024-01-16' },
              notes: { type: :string, example: 'Updated work on feature development', nullable: true }
            }
          }
        },
        required: ['shift']
      }

      response(200, 'shift updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            employment_id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            group_id: { type: :integer, example: 1, nullable: true },
            minutes_worked: { type: :integer, example: 520 },
            date: { type: :string, format: 'date', example: '2024-01-16' },
            notes: { type: :string, example: 'Updated work on feature development', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:shift) { { shift: { minutes_worked: 520, date: '2024-01-16', notes: 'Updated work on feature development' } } }
        run_test!
      end
    end

    delete('delete shift') do
      tags 'Shifts'
      description 'Delete a shift'

      response(204, 'shift deleted') do
        let(:id) { '1' }
        run_test!
      end

      response(404, 'shift not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Shift not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
