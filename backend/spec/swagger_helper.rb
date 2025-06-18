# frozen_string_literal: true

require 'rails_helper'

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.openapi_root = Rails.root.join('swagger').to_s

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the 'rswag:specs:swaggerize' rake task, the complete Swagger will
  # be generated at the provided relative path under openapi_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a openapi_spec tag to the
  # the root example_group in your specs, e.g. describe '...', openapi_spec: 'v2/swagger.json'
  config.openapi_specs = {
    'v1/swagger.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'API V1',
        version: 'v1'
      },
      paths: {},
      components: {
        schemas: {
          Company: {
            type: :object,
            properties: {
              id: { type: :integer, example: Faker::Number.number(digits: 2) },
              name: { type: :string, example: Faker::Company.name },
              description: { type: :string, example: Faker::Company.catch_phrase },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'name']
          },
          User: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              first_name: { type: :string, example: Faker::Name.first_name },
              last_name: { type: :string, example: Faker::Name.last_name },
              username: { type: :string, example: Faker::Internet.username, minLength: 3, maxLength: 20 },
              email: { type: :string, format: 'email', example: Faker::Internet.email },
              name: { type: :string, example: Faker::Name.name },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'first_name', 'last_name', 'username', 'email']
          },
          Profile: {
            type: :object,
            properties: {
              first_name: { type: :string, example: Faker::Name.first_name },
              last_name: { type: :string, example: Faker::Name.last_name },
              username: { type: :string, example: Faker::Internet.username },
              email: { type: :string, format: 'email', example: Faker::Internet.email }
            }
          },
          AuthenticatedUser: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              email: { type: :string, format: 'email', example: Faker::Internet.email },
              first_name: { type: :string, example: Faker::Name.first_name },
              last_name: { type: :string, example: Faker::Name.last_name },
              username: { type: :string, example: Faker::Internet.username },
            },
            required: ['id', 'email']
          },
          Employment: {
            type: :object,
            properties: {
              id: { type: :integer, example: Faker::Number.number(digits: 2) },
              user_id: { type: :integer, example: Faker::Number.number(digits: 2) },
              position_id: { type: :integer, example: Faker::Number.number(digits: 2) },
              start_date: { type: :string, format: 'date', example: Faker::Date.backward(days: 30).to_s },
              end_date: { type: :string, format: 'date', nullable: true, example: Faker::Date.forward(days: 30).to_s },
              active: { type: :boolean, example: true },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'user_id', 'position_id', 'start_date', 'active']
          },
          EmploymentWithDetails: {
            allOf: [
              { '$ref': '#/components/schemas/Employment' },
              {
                type: :object,
                properties: {
                  position: { '$ref': '#/components/schemas/Position' },
                  company: { '$ref': '#/components/schemas/Company' }
                },
                required: ['position', 'company']
              }
            ]
          },
          Position: {
            type: :object,
            properties: {
              id: { type: :integer, example: Faker::Number.number(digits: 2) },
              title: { type: :string, example: Faker::Job.title },
              description: { type: :string, example: Faker::Company.catch_phrase },
              company_id: { type: :integer, example: Faker::Number.number(digits: 2) },
              remote: { type: :boolean, example: Faker::Boolean.boolean },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'title', 'company_id']
          },
          Shift: {
            type: :object,
            properties: {
              id: { type: :integer, example: Faker::Number.number(digits: 2) },
              employment_id: { type: :integer, example: Faker::Number.number(digits: 2) },
              date: { type: :string, format: 'date', example: Faker::Date.backward(days: 30).to_s },
              start_time: { type: :string, format: 'date-time', example: Faker::Time.backward(days: 30) },
              end_time: { type: :string, format: 'date-time', nullable: true, example: Faker::Time.backward(days: 29) },
              hours: { type: :number, format: 'float', example: Faker::Number.decimal(l_digits: 1, r_digits: 2) },
              active: { type: :boolean, example: Faker::Boolean.boolean },
              created_at: { type: :string, format: 'date-time' },
              updated_at: { type: :string, format: 'date-time' }
            },
            required: ['id', 'employment_id', 'date', 'start_time']
          },
          ClockInRequest: {
            type: :object,
            properties: {
              employment_id: { type: :integer, description: 'ID of the employment to clock in for' }
            },
            required: ['employment_id']
          },
          ClockOutRequest: {
            type: :object,
            properties: {
              employment_id: { type: :integer, description: 'ID of the employment to clock out of' }
            },
            required: ['employment_id']
          },
          DashboardResponse: {
            type: :object,
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
                additionalProperties: { type: :number, format: 'float', example: 38.5 }
              },
              current_shifts: {
                type: :array,
                items: { '$ref': '#/components/schemas/Shift' }
              }
            },
            required: ['shifts', 'active_employments', 'total_weekly_hours', 'current_shifts']
          },
          UserCreateRequest: {
            type: :object,
            properties: {
              first_name: { type: :string },
              last_name: { type: :string },
              username: { type: :string },
              email: { type: :string, format: 'email' },
              password: { type: :string },
              password_confirmation: { type: :string }
            },
            required: ['first_name', 'last_name', 'username', 'email', 'password', 'password_confirmation']
          },
          UserUpdateRequest: {
            type: :object,
            properties: {
              first_name: { type: :string },
              last_name: { type: :string },
              username: { type: :string },
              email: { type: :string, format: 'email' },
              password: { type: :string },
              password_confirmation: { type: :string }
            },
            required: []
          },
          LoginResponse: {
            type: :object,
            properties: {
              user: { '$ref': '#/components/schemas/AuthenticatedUser' }
            },
            required: ['user']
          },
          CreateComponyRequest: {
            type: :object,
            properties: {
              name: { type: :string },
              description: { type: :string }
            },
            required: ['name']
          },
          UpdateCompanyRequest: {
            type: :object,
            properties: {
              name: { type: :string },
              description: { type: :string }
            },
            required: []
          },
          ProfileResponse: {
            type: :object,
            properties: {
              user: {
                allOf: [
                  { '$ref': '#/components/schemas/User' },
                  {
                    type: :object,
                    properties: {
                      employments: {
                        type: :array,
                        items: {
                          allOf: [
                            { '$ref': '#/components/schemas/Employment' },
                            {
                              type: :object,
                              properties: {
                                position: { '$ref': '#/components/schemas/Position' },
                                company: { '$ref': '#/components/schemas/Company' }
                              },
                              required: ['position', 'company']
                            }
                          ]
                        }
                      }
                    },
                    required: ['employments']
                  }
                ]
              }
            },
            required: ['user']
          },
          ProfileUpdateRequest: {
            type: :object,
            properties: {
              profile: { '$ref': '#/components/schemas/Profile' }
            },
            required: ['profile']
          }
        }
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        },
        {
          url: 'https://api.nmd98.com',
          description: 'Production server'
        }
      ]
    }
  }

  # Specify the format of the output Swagger file when running 'rswag:specs:swaggerize'.
  # The openapi_specs configuration option has the filename including format in
  # the key, this may want to be changed to avoid putting yaml in json files.
  # Defaults to json. Accepts ':json' and ':yaml'.
  config.openapi_format = :yaml
end
