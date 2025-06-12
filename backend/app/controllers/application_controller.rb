class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include ActionController::Cookies

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :force_json_response

  protected

  def force_json_response
    request.format = :json
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name, :username, :email])
    devise_parameter_sanitizer.permit(:account_update, keys: [:first_name, :last_name, :username, :email])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:username, :email, :password])
  end
end
