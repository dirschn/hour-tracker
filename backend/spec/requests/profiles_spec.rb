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
end
