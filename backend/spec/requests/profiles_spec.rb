require 'rails_helper'

RSpec.describe "Profiles", type: :request do
  describe "GET /profile" do
    path '/profile' do
      get('show profile') do
        tags 'Profiles'
        produces 'application/json'

        response(200, 'successful') do
          schema '$ref' => '#/components/schemas/ProfileResponse'

          let!(:user) { create(:user) }
          let!(:company) { create(:company) }
          let!(:position) { create(:position, company: company) }
          let!(:employment) { create(:employment, user: user, position: position) }

          before do
            sign_in user
          end

          run_test!
        end

        response(404, 'user not found') do
          schema type: :object,
            properties: {
              error: { type: :string }
            },
            required: ['error']

          let!(:user) { create(:user) }

          before do
            sign_in user
            allow(User).to receive(:includes).and_return(double(find: nil))
          end

          run_test!
        end
      end
    end
  end

  describe "PATCH /profile" do
    path '/profile' do
      patch('update profile') do
        tags 'Profiles'
        consumes 'application/json'
        produces 'application/json'
        parameter name: :profile, in: :body, schema: {
          '$ref' => '#/components/schemas/ProfileUpdateRequest'
        }

        response(200, 'successful') do
          schema type: :object,
            properties: {
              message: { type: :string }
            },
            required: ['message']

          let!(:user) { create(:user) }
          let(:profile) do
            {
              profile: {
                first_name: 'Updated',
                last_name: 'Name',
                email: 'updated@example.com',
                username: 'updated_user'
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
              error: {
                type: :array,
                items: { type: :string }
              }
            },
            required: ['error']

          let!(:user) { create(:user) }
          let(:profile) do
            {
              profile: {
                email: 'invalid-email'
              }
            }
          end

          before do
            sign_in user
          end

          run_test!
        end
      end
    end
  end
end
