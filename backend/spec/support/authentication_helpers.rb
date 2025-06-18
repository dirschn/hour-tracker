require 'devise'

module AuthenticationHelpers
  include Warden::Test::Helpers

  def sign_in(user)
    login_as(user, scope: :user)
  end

  def sign_out
    logout(:user)
  end
end

RSpec.configure do |config|
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.include AuthenticationHelpers, type: :request

  config.before(:suite) do
    Warden.test_mode!
  end

  config.after(:each) do
    Warden.test_reset!
  end
end
