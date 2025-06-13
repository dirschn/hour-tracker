RSpec.describe 'Employments', type: :request do
  path '/employments/{id}/clock_in' do
    post('clock in employment') do
      tags 'Employments'
      description 'Clock in for a specific employment'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :id, in: :path, type: :string, description: 'Employment ID'

      response(200, 'successful clock in') do
        schema '$ref': '#/components/schemas/Shift'

        run_test!
      end

      response(422, 'unprocessable entity') do
        schema type: :object,
          properties: {
            errors: {
              type: :string,
              example: 'Already clocked in for this employment'
            }
          }

        let(:id) { '1' } # Assuming employment with ID 1 exists and is already clocked in
        run_test!
      end

      response(401, 'unauthorized') do
        let(:id) { 'invalid' }
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

        run_test!
      end

      response(422, 'unprocessable entity') do
        schema type: :object,
          properties: {
            errors: {
              type: :string,
              example: 'No active shift to clock out of'
            }
          }

        let(:id) { '1' } # Assuming employment with ID 1 exists and is already clocked in
        run_test!
      end

      response(401, 'unauthorized') do
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
