require 'swagger_helper'

RSpec.describe 'Dashboard', type: :request do
  path '/' do
    get('show dashboard') do
      tags 'Dashboard'
      description 'Retrieve dashboard data including active employments, shifts, total weekly hours, daily hours per employment, and current shifts'
      produces 'application/json'

      response(200, 'successful') do
        schema type: :object,
          properties: {
            shifts: {
              type: :array,
              items: { '$ref': '#/components/schemas/Shift' }
            },
            active_employments: {
              type: :array,
              items: { '$ref': '#/components/schemas/EmploymentWithDetails' }
            },
            total_weekly_hours: {
              type: :object,
              description: 'Object where each key is an employment ID (as a string) and each value is the total hours worked that week (float).',
              additionalProperties: { type: :number, format: 'float', example: 38.5 } },
            daily_hours: {
              type: :object,
              description: 'Object where each key is a date and employment ID (format "YYYY-MM-DD_EMPLOYMENT_ID") and each value is the total hours worked that day (float).',
              additionalProperties: { type: :number, format: 'float', example: 8.0 } },
            current_shifts: {
              type: :array,
              items: { '$ref': '#/components/schemas/Shift' }
            }
          },
          required: ['shifts', 'active_employments', 'total_weekly_hours', 'daily_hours', 'current_shifts']

        let!(:user) { create(:user) }

        run_test!
      end
    end
  end
end
