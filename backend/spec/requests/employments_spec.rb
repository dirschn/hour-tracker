require 'swagger_helper'

RSpec.describe 'Employments', type: :request do
  let(:user) { create(:user) }
  let(:company) { create(:company) }
  let(:position) { create(:position, company: company) }
  let(:employment) { create(:employment, user: user, position: position) }

  path '/employments' do
    get('list employments') do
      tags 'Employments'
      description 'Get all employments for the current user'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :array,
          items: {
            '$ref': '#/components/schemas/Employment'
          }

        let!(:employment1) { create(:employment, user: user) }
        let!(:employment2) { create(:employment, :ended, user: user) }

        before do
          sign_in user
        end

        run_test!
      end

      response(401, 'unauthorized') do
        run_test!
      end
    end

    post('create employment') do
      tags 'Employments'
      description 'Create a new employment'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :employment_params, in: :body, schema: {
        '$ref': '#/components/schemas/EmploymentCreateRequest'
      }

      response(201, 'created') do
        schema '$ref': '#/components/schemas/Employment'

        let(:employment_params) do
          {
            employment: {
              position_id: position.id,
              start_date: '2024-01-01'
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

        let(:employment_params) do
          {
            employment: {
              position_id: nil,
              start_date: nil
            }
          }
        end

        before do
          sign_in user
        end

        run_test!
      end

      response(401, 'unauthorized') do
        let(:employment_params) do
          {
            employment: {
              position_id: position.id,
              start_date: '2024-01-01'
            }
          }
        end

        run_test!
      end
    end
  end

  path '/employments/{id}' do
    parameter name: :id, in: :path, type: :string, description: 'Employment ID'

    get('show employment') do
      tags 'Employments'
      description 'Get a specific employment'
      produces 'application/json'

      response(200, 'successful') do
        schema '$ref': '#/components/schemas/Employment'

        let(:id) { employment.id }

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
        let(:id) { employment.id }

        run_test!
      end
    end

    patch('update employment') do
      tags 'Employments'
      description 'Update an employment'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :employment_params, in: :body, schema: {
        '$ref': '#/components/schemas/EmploymentUpdateRequest'
      }

      response(200, 'successful') do
        schema '$ref': '#/components/schemas/Employment'

        let(:id) { employment.id }
        let(:employment_params) do
          {
            employment: {
              end_date: '2024-12-31'
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

        let(:id) { employment.id }
        let(:employment_params) do
          {
            employment: {
              start_date: nil
            }
          }
        end

        before do
          sign_in user
        end

        run_test!
      end

      response(401, 'unauthorized') do
        let(:id) { employment.id }
        let(:employment_params) { { employment: { end_date: '2024-12-31' } } }

        run_test!
      end
    end

    delete('delete employment') do
      tags 'Employments'
      description 'Delete an employment'

      response(204, 'no content') do
        let(:id) { employment.id }

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
        let(:id) { employment.id }

        run_test!
      end
    end
  end

  path '/employments/{id}/clock_in' do
    post('clock in employment') do
      tags 'Employments'
      description 'Clock in for a specific employment'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :id, in: :path, type: :string, description: 'Employment ID'

      response(201, 'successful clock in') do
        schema '$ref': '#/components/schemas/Shift'

        let(:id) { employment.id }

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

        let(:id) { employment.id }

        before do
          sign_in user
          # Create an active shift to trigger the "already clocked in" error
          create(:shift, employment: employment, date: Date.current, start_time: Time.current, end_time: nil)
        end

        run_test!
      end

      response(401, 'unauthorized') do
        let(:id) { employment.id }
        run_test!
      end
    end
  end

  path '/employments/{id}/clock_out' do
    post('clock out employment') do
      tags 'Employments'
      description 'Clock out for a specific employment'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :id, in: :path, type: :string, description: 'Employment ID'

      response(200, 'successful clock out') do
        schema '$ref': '#/components/schemas/Shift'

        let(:id) { employment.id }

        before do
          sign_in user
          # Create an active shift to clock out of
          create(:shift, employment: employment, date: Date.current, start_time: Time.current, end_time: nil)
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

        let(:id) { employment.id }

        before do
          sign_in user
          # Don't create any shifts to trigger the "no active shift" error
        end

        run_test!
      end

      response(401, 'unauthorized') do
        let(:id) { employment.id }
        run_test!
      end
    end
  end
end
