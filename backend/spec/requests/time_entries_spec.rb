require 'swagger_helper'

RSpec.describe 'time_entries', type: :request do
  path '/time_entries' do
    get('list time entries') do
      tags 'Time Entries'
      description 'Retrieve all time entries'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              user_position_id: { type: :integer, example: 1 },
              user_id: { type: :integer, example: 1 },
              group_id: { type: :integer, example: 1, nullable: true },
              minutes_worked: { type: :integer, example: 480 },
              date: { type: :string, format: 'date', example: '2024-01-15' },
              notes: { type: :string, example: 'Worked on feature development', nullable: true },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'user_position_id', 'user_id', 'minutes_worked', 'date']
          }

        run_test!
      end
    end

    post('create time entry') do
      tags 'Time Entries'
      description 'Create a new time entry'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :time_entry, in: :body, schema: {
        type: :object,
        properties: {
          time_entry: {
            type: :object,
            properties: {
              user_position_id: { type: :integer, example: 1 },
              user_id: { type: :integer, example: 1 },
              group_id: { type: :integer, example: 1, nullable: true },
              minutes_worked: { type: :integer, example: 480 },
              date: { type: :string, format: 'date', example: '2024-01-15' },
              notes: { type: :string, example: 'Worked on feature development', nullable: true }
            },
            required: ['user_position_id', 'user_id', 'minutes_worked', 'date']
          }
        },
        required: ['time_entry']
      }

      response(201, 'time entry created') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_position_id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            group_id: { type: :integer, example: 1, nullable: true },
            minutes_worked: { type: :integer, example: 480 },
            date: { type: :string, format: 'date', example: '2024-01-15' },
            notes: { type: :string, example: 'Worked on feature development', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:time_entry) { { time_entry: { user_position_id: 1, user_id: 1, minutes_worked: 480, date: '2024-01-15' } } }
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

        let(:time_entry) { { time_entry: { user_position_id: nil, minutes_worked: 1500, date: '' } } }
        run_test!
      end
    end
  end

  path '/time_entries/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'time entry id'

    get('show time entry') do
      tags 'Time Entries'
      description 'Retrieve a specific time entry'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_position_id: { type: :integer, example: 1 },
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

      response(404, 'time entry not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Time entry not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('update time entry') do
      tags 'Time Entries'
      description 'Update a time entry'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :time_entry, in: :body, schema: {
        type: :object,
        properties: {
          time_entry: {
            type: :object,
            properties: {
              minutes_worked: { type: :integer, example: 520 },
              date: { type: :string, format: 'date', example: '2024-01-16' },
              notes: { type: :string, example: 'Updated work on feature development', nullable: true }
            }
          }
        },
        required: ['time_entry']
      }

      response(200, 'time entry updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_position_id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            group_id: { type: :integer, example: 1, nullable: true },
            minutes_worked: { type: :integer, example: 520 },
            date: { type: :string, format: 'date', example: '2024-01-16' },
            notes: { type: :string, example: 'Updated work on feature development', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:time_entry) { { time_entry: { minutes_worked: 520, date: '2024-01-16', notes: 'Updated work on feature development' } } }
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
        let(:time_entry) { { time_entry: { minutes_worked: 1500 } } }
        run_test!
      end

      response(404, 'time entry not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Time entry not found' }
          }

        let(:id) { 'invalid' }
        let(:time_entry) { { time_entry: { minutes_worked: 520 } } }
        run_test!
      end
    end

    put('update time entry') do
      tags 'Time Entries'
      description 'Update a time entry (PUT)'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :time_entry, in: :body, schema: {
        type: :object,
        properties: {
          time_entry: {
            type: :object,
            properties: {
              minutes_worked: { type: :integer, example: 520 },
              date: { type: :string, format: 'date', example: '2024-01-16' },
              notes: { type: :string, example: 'Updated work on feature development', nullable: true }
            }
          }
        },
        required: ['time_entry']
      }

      response(200, 'time entry updated') do
        schema type: :object,
          properties: {
            id: { type: :integer, example: 1 },
            user_position_id: { type: :integer, example: 1 },
            user_id: { type: :integer, example: 1 },
            group_id: { type: :integer, example: 1, nullable: true },
            minutes_worked: { type: :integer, example: 520 },
            date: { type: :string, format: 'date', example: '2024-01-16' },
            notes: { type: :string, example: 'Updated work on feature development', nullable: true },
            created_at: { type: :string, format: 'date-time' },
            updated_at: { type: :string, format: 'date-time' }
          }

        let(:id) { '1' }
        let(:time_entry) { { time_entry: { minutes_worked: 520, date: '2024-01-16', notes: 'Updated work on feature development' } } }
        run_test!
      end
    end

    delete('delete time entry') do
      tags 'Time Entries'
      description 'Delete a time entry'

      response(204, 'time entry deleted') do
        let(:id) { '1' }
        run_test!
      end

      response(404, 'time entry not found') do
        schema type: :object,
          properties: {
            error: { type: :string, example: 'Time entry not found' }
          }

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
