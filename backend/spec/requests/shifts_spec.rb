require 'swagger_helper'

RSpec.describe 'Shifts', type: :request do
  let(:user) { create(:user) }
  let(:company) { create(:company) }
  let(:position) { create(:position, company: company) }
  let(:employment) { create(:employment, user: user, position: position) }
  let(:shift) { create(:shift, :completed, employment: employment) }

  path '/shifts/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'Shift ID'

    get('show shift') do
      tags 'Shifts'
      description 'Show a specific shift'
      produces 'application/json'

      response(200, 'successful') do
        schema '$ref': '#/components/schemas/ShiftResponse'

        let(:id) { shift.id }

        before do
          sign_in user
        end

        run_test!
      end

      response(404, 'not found') do
        let(:id) { 'invalid' }

        before do
          sign_in user
        end

        run_test!
      end

      response(401, 'unauthorized') do
        let(:id) { shift.id }

        run_test!
      end
    end

    patch('update shift') do
      tags 'Shifts'
      description 'Update a shift'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :shift_params, in: :body, schema: {
        type: :object,
        properties: {
          shift: {
            type: :object,
            properties: {
              date: { type: :string, format: :date },
              start_time: { type: :string, format: 'date-time' },
              end_time: { type: :string, format: 'date-time', nullable: true },
              employment_id: { type: :integer },
              description: { type: :string }
            }
          }
        },
        required: ['shift']
      }

      response(200, 'successful') do
        schema '$ref': '#/components/schemas/Shift'

        let(:id) { shift.id }
        let(:shift_params) do
          {
            shift: {
              date: '2024-01-15',
              start_time: '2024-01-15T09:00:00Z',
              end_time: '2024-01-15T17:00:00Z',
              employment_id: employment.id,
              description: 'Updated work description'
            }
          }
        end

        before do
          sign_in user
        end

        run_test!
      end

      response(422, 'unprocessable entity') do
        schema type: :object,
          properties: {
            errors: {
              type: :array,
              items: { type: :string }
            }
          }

        let(:id) { shift.id }
        let(:shift_params) do
          {
            shift: {
              date: nil,
              start_time: nil
            }
          }
        end

        before do
          sign_in user
        end

        run_test!
      end

      response(404, 'not found') do
        schema type: :object,
          properties: {
            error: { type: :string }
          }

        let(:id) { 'invalid' }
        let(:shift_params) do
          {
            shift: {
              description: 'Some description'
            }
          }
        end

        before do
          sign_in user
        end

        run_test!
      end

      response(401, 'unauthorized') do
        let(:id) { shift.id }
        let(:shift_params) { { shift: { description: 'Unauthorized update' } } }

        run_test!
      end
    end

    delete('delete shift') do
      tags 'Shifts'
      description 'Delete a shift'

      response(204, 'no content') do
        let(:id) { shift.id }

        before do
          sign_in user
        end

        run_test!
      end

      response(404, 'not found') do
        let(:id) { 'invalid' }

        before do
          sign_in user
        end

        run_test!
      end

      response(401, 'unauthorized') do
        let(:id) { shift.id }

        run_test!
      end
    end
  end
end
